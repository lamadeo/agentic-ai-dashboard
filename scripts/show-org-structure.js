const { buildOrgMappingFromHierarchy } = require('./parse-hierarchy');
const path = require('path');

const hierarchyPath = path.join(__dirname, '../data/techco_org_chart.json');
const orgEmailMap = buildOrgMappingFromHierarchy(hierarchyPath);

console.log('\n\n📋 COMPLETE ORGANIZATIONAL STRUCTURE\n');
console.log('═══════════════════════════════════════════════════════════════\n');

// Group by department and team
const structure = new Map();

orgEmailMap.forEach((info, email) => {
  const dept = info.department;
  const team = info.team || 'Individual Contributors';

  if (!structure.has(dept)) {
    structure.set(dept, {
      head: null,
      teams: new Map()
    });
  }

  const deptData = structure.get(dept);

  // Track department head
  if (info.isDeptHead && !deptData.head) {
    deptData.head = {
      name: info.name,
      title: info.title,
      email
    };
  }

  // Add employee to team
  if (!deptData.teams.has(team)) {
    deptData.teams.set(team, {
      leader: null,
      members: []
    });
  }

  const teamData = deptData.teams.get(team);

  // Track team leader
  if (info.isTeamLeader && !teamData.leader) {
    teamData.leader = {
      name: info.name,
      title: info.title,
      email
    };
  }

  // Add as team member
  teamData.members.push({
    name: info.name,
    title: info.title,
    email,
    isDeptHead: info.isDeptHead,
    isTeamLeader: info.isTeamLeader
  });
});

// Sort departments by employee count
const sortedDepts = Array.from(structure.entries())
  .map(([dept, data]) => {
    const totalMembers = Array.from(data.teams.values()).reduce((sum, team) => sum + team.members.length, 0);
    return { dept, data, totalMembers };
  })
  .sort((a, b) => b.totalMembers - a.totalMembers);

// Display structure
sortedDepts.forEach(({ dept, data, totalMembers }) => {
  console.log(`\n🏢 ${dept} (${totalMembers} employees)`);
  console.log('═'.repeat(70));

  if (data.head) {
    console.log(`\n   👑 Department Head: ${data.head.name}`);
    console.log(`      Title: ${data.head.title}`);
    console.log(`      Email: ${data.head.email}`);
  }

  // Sort teams
  const sortedTeams = Array.from(data.teams.entries())
    .map(([teamName, teamData]) => ({ teamName, teamData }))
    .sort((a, b) => b.teamData.members.length - a.teamData.members.length);

  sortedTeams.forEach(({ teamName, teamData }) => {
    console.log(`\n   📂 Team: ${teamName} (${teamData.members.length} members)`);
    console.log(`   ${'─'.repeat(66)}`);

    if (teamData.leader) {
      console.log(`      🔹 Team Leader: ${teamData.leader.name}`);
      console.log(`         Title: ${teamData.leader.title}`);
      console.log(`         Email: ${teamData.leader.email}\n`);
    }

    // Show all team members
    teamData.members
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(member => {
        const badge = member.isDeptHead ? ' 👑' : (member.isTeamLeader ? ' 🔹' : '');
        console.log(`      • ${member.name}${badge}`);
        console.log(`        ${member.title}`);
        console.log(`        ${member.email}`);
      });
  });
});

console.log('\n\n═══════════════════════════════════════════════════════════════');
console.log('📊 SUMMARY\n');

const totalEmployees = orgEmailMap.size + 1; // +1 for CEO
console.log(`Total Employees: ${totalEmployees}`);
console.log(`Total Departments: ${sortedDepts.length}`);
console.log(`\nTop 5 Departments by Size:`);
sortedDepts.slice(0, 5).forEach((d, i) => {
  console.log(`   ${i + 1}. ${d.dept}: ${d.totalMembers} employees`);
});
