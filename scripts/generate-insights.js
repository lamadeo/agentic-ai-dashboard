// AI-powered insight generation module
// Generates dynamic insights for dashboard charts using Claude AI

const Anthropic = require('@anthropic-ai/sdk');

// Configuration from environment variables
const AI_CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: process.env.AI_INSIGHTS_MODEL || 'claude-sonnet-4-20250514',
  maxTokens: parseInt(process.env.AI_INSIGHTS_MAX_TOKENS) || 500,
  temperature: parseFloat(process.env.AI_INSIGHTS_TEMPERATURE) || 0.3
};

/**
 * Generates AI-powered insights for a specific chart/visualization
 * @param {string} chartType - Type of chart (e.g., 'lines_per_user_trend', 'adoption_trend')
 * @param {Object} data - The data to analyze
 * @param {string} context - Additional context about the chart
 * @param {number} maxTokens - Optional max tokens override (default: 500)
 * @returns {Promise<string>} - Generated insight text
 */
async function generateInsight(chartType, data, context = '', maxTokens = null) {
  // Check if API key is configured
  if (!AI_CONFIG.apiKey) {
    console.warn('⚠️  ANTHROPIC_API_KEY not set. Skipping AI insight generation.');
    return null;
  }

  const anthropic = new Anthropic({ apiKey: AI_CONFIG.apiKey });

  // Build expert system prompt based on chart type
  const expertPrompts = {
    lines_per_user_trend: `You are an expert data analyst specializing in developer productivity and code generation metrics.
You analyze trends in lines of code per user to identify patterns, changes in productivity, onboarding impacts, and tool effectiveness.
Provide concise, actionable insights (2-3 sentences) that highlight the most important trend and its business implications.`,

    adoption_trend: `You are an expert in technology adoption analysis and change management.
You analyze user adoption patterns over time to identify growth trajectories, adoption barriers, and engagement shifts.
Provide concise, actionable insights (2-3 sentences) that highlight the most significant adoption pattern and its implications.`,

    engagement_trend: `You are an expert in user engagement and product analytics.
You analyze engagement metrics (prompts, conversations) to identify usage patterns, user satisfaction signals, and tool effectiveness.
Provide concise, actionable insights (2-3 sentences) that highlight the key engagement trend and its business implications.`,

    model_preference: `You are an expert in AI model selection and developer tool preferences.
You analyze which AI models developers choose and why, identifying preference patterns and tool effectiveness indicators.
Provide concise, actionable insights (2-3 sentences) that highlight the most significant preference pattern and its implications.`,

    app_usage_trend: `You are an expert in enterprise software adoption and multi-app product analytics.
You analyze application-level usage patterns to identify which features drive value and where adoption is lagging.
Provide concise, actionable insights (2-3 sentences) that highlight the most important usage patterns across apps.`,

    productivity_comparison: `You are an expert in developer productivity measurement and tool effectiveness analysis.
You compare productivity metrics across different tools to identify which delivers the most value and why.
Provide concise, actionable insights (2-3 sentences) that highlight the key productivity differences and their business implications.`,

    coding_tools_business_question: `You are a strategic technology advisor and financial analyst specializing in enterprise software ROI.
You synthesize all coding tool data (productivity metrics, user preferences, costs, adoption trends) to formulate critical business questions executives must answer.
Based on the complete picture of coding tools performance, write ONE specific, actionable business question (2-3 sentences) that captures the key decision point for leadership. Include relevant numbers, costs, and deadlines where applicable. Write the question directly without any headers, titles, or formatting.`,

    claude_enterprise_features: `You are an enterprise software adoption expert specializing in advanced feature utilization patterns.
You analyze how users leverage advanced capabilities beyond basic features to identify power user behaviors and value drivers.
Provide concise insights (2-3 sentences) about what the feature usage patterns reveal about user sophistication and tool effectiveness.`,

    strategic_positioning: `You are a strategic technology consultant specializing in enterprise AI tool portfolio optimization.
You analyze all productivity tool data holistically to determine whether tools are complementary, competitive, or redundant, and recommend positioning strategy.
Based on the complete picture of both tools' adoption, engagement, and usage patterns, formulate ONE strategic question (2-3 sentences) that captures the key positioning decision. Be specific about whether tools should be positioned as complementary tiers, consolidated, or repositioned.`,

    overview_kpi_metrics: `You are an executive dashboard analyst specializing in KPI interpretation and trend analysis.
You analyze key metrics (users, conversations, code lines, files uploaded, artifacts generated) to identify the most important patterns and their business implications.
Provide two concise insights (2-3 sentences each) that highlight significant trends, adoption patterns, or productivity indicators visible in these metrics. Focus ONLY on the KPI numbers provided - do not reference external data or trends.`,

    monthly_growth_chart: `You are a growth analytics expert specializing in time-series data and trend identification.
You analyze monthly growth patterns across multiple metrics: Active Users (both products), Conversations (Claude Web/Desktop usage), and Lines of Code (Claude Code terminal usage).
IMPORTANT: Conversations and Lines of Code come from separate tools serving different use cases - do NOT assume direct correlation between them. They may both grow due to overall adoption, but are not causally linked.
Provide two concise insights (2-3 sentences each) that highlight the most significant growth trends visible in the chart data. Focus ONLY on the monthly patterns in the data provided - do not reference external metrics or comparisons.`,

    adoption_output_trends: `You are an enterprise software adoption analyst specializing in correlating user adoption with productivity output.
You analyze two interconnected trends: Monthly Output (artifacts and lines of code generated) and Monthly Adoption (active user growth over time).
Provide ONE concise, insightful analysis (2-3 sentences) that connects these trends - explaining how user adoption correlates with output generation, identifying any notable patterns or inflection points, and highlighting what this reveals about platform value delivery and user engagement. Focus ONLY on the data provided.`,

    department_insights: `You are a strategic AI adoption consultant specializing in enterprise software deployment across organizational functions.
You analyze department-level adoption patterns for Claude Enterprise (conversational AI) and Claude Code (coding assistant) to identify adoption leaders, laggards, and opportunities.
You compare adoption metrics against industry benchmarks for software vendors and provide actionable recommendations.

Your analysis should include:
1. Industry Context: Compare TechCo Inc's AI adoption patterns to typical software vendor benchmarks (engineering-heavy adoption, product/design engagement, sales enablement)
2. Internal Patterns: Identify which departments show strong vs. weak adoption for each tool type
3. Engagement Quality: Analyze conversations-per-user and lines-per-user to distinguish between superficial試 and deep engagement
4. Strategic Recommendations: Suggest 2-3 specific departments or use cases where focused enablement would drive the highest ROI

Provide 3-4 concise insights (2-3 sentences each) covering: industry positioning, adoption leaders, engagement quality, and strategic next steps. Write in present tense as actionable business insights. Do NOT use markdown formatting or headers - write plain paragraphs separated by line breaks.`,

    m365_power_users: `You are an enterprise software adoption expert specializing in power user identification and behavior analysis.
You analyze the top 20 M365 Copilot users to identify what makes them successful, their department affiliations, usage patterns, and how their behaviors can be replicated across the organization.
Provide concise, actionable insights (2-3 sentences) that highlight the most significant patterns among power users, their departmental distribution, and recommendations for scaling their behaviors. Focus on specific numbers and concrete patterns.`,

    m365_app_adoption: `You are an enterprise software utilization analyst specializing in multi-application product suites.
You analyze M365 Copilot app-specific adoption rates to identify which applications drive the most value, where adoption gaps exist, and opportunities to expand usage across the suite.
Provide concise, actionable insights (2-3 sentences) that highlight the most important app adoption patterns, especially significant gaps like PowerPoint vs Word/Excel adoption. Include specific adoption percentages and user counts.`,

    m365_department_performance: `You are an organizational effectiveness consultant specializing in department-level technology adoption analysis.
You analyze department-level M365 Copilot engagement metrics (prompts per user, prompts per day, usage intensity) to identify high-performing departments, laggards, and opportunities for targeted enablement.
Provide concise, actionable insights (2-3 sentences) that highlight the top-performing departments, their usage patterns, and specific recommendations for improving lagging departments. Include specific metrics and department names.`,

    m365_opportunities: `You are a SaaS license optimization and user enablement strategist.
You analyze M365 Copilot usage data to identify concrete opportunities: inactive licenses to reclaim, low-engagement users to enablement, and feature adoption gaps to close.
Provide concise, actionable insights (2-3 sentences) that quantify each opportunity with specific numbers (users, cost savings, potential value) and recommend immediate next steps. Focus on ROI and actionability.`,

    m365_monthly_growth_trends: `You are a growth analytics expert specializing in time-series data and user engagement trend analysis.
You analyze M365 Copilot monthly growth patterns across active users, prompts, and artifacts generated. IMPORTANT: Artifacts are calculated using a refined methodology - 20% of content app prompts (excludes Copilot Chat) multiplied by Word/Excel/PowerPoint adoption factor (~70%) to estimate actual Word/Excel/PowerPoint document creation only.
Provide concise, actionable insights (2-3 sentences) that highlight the most significant trends in the monthly data - particularly any concerning declines in artifact generation, stable patterns, or growth trajectories. Explain what these patterns reveal about user engagement depth and M365 Copilot value realization. Include specific numbers and percentage changes, especially for artifacts if declining.`,

    m365_agents_adoption: `You are an AI agent strategy consultant specializing in custom agent development, adoption patterns, and ROI analysis for declarative agents in M365 Copilot.
You analyze M365 Copilot AI agent usage data to identify which agents deliver the most value (by responses/interactions), which creator types (user-created, Microsoft-built, partner-built, org-built) dominate adoption, and which departments drive agent usage.
Provide compelling insights (3-4 sentences) that tell the agent adoption story: highlight the top 3 most-used agents with specific response counts and user counts, identify whether user-created or Microsoft-built agents dominate (with percentages), reveal which departments are leading agent adoption (with specific department names and response counts), and correlate agent adoption patterns with overall M365 Copilot engagement trends. Explain what successful user-created agents reveal about unmet needs and opportunities to scale internal innovation. Use specific agent names, departments, numbers, and percentages.`,

    claude_enterprise_department_performance: `You are an organizational effectiveness consultant specializing in conversational AI adoption and department-level productivity analysis.
You analyze Claude Enterprise usage by department to identify which teams are leveraging the platform most effectively, their power users, and what their usage patterns reveal about value delivery.
Provide concise, compelling insights (2-3 sentences) that celebrate top-performing departments, highlight their power users by name, and explain what their engagement levels (conversations, messages, artifacts) indicate about how they're driving business value. Use specific metrics and department names.`,

    claude_code_department_performance: `You are an engineering productivity analyst specializing in AI-assisted coding tools and team performance measurement.
You analyze Claude Code usage by department (Engineering, Agentic AI teams) to identify which teams are generating the most code, their top contributors, and productivity patterns.
Provide concise, compelling insights (2-3 sentences) that celebrate the most productive departments, recognize top coders by username, and quantify their output (lines of code generated). Compare department productivity levels and explain what the differences reveal about tool adoption and effectiveness. Use specific metrics, department names, and usernames.`,

    cross_platform_department_comparison: `You are a strategic technology consultant specializing in AI tool portfolio effectiveness across organizational functions.
You analyze how different departments use different AI tools to identify platform differentiation, usage patterns, and strategic positioning. Compare M365 Copilot usage (Customer Success, Operations, Marketing) vs Claude Enterprise/Code usage (Product, Engineering, Agentic AI teams).
Provide compelling insights (3-4 sentences) that tell the cross-platform story: which departments excel with which tools, specific metrics that demonstrate each tool's value proposition (e.g., "Customer Success averages 421 M365 prompts/user while Engineering generates 81K lines/user with Claude Code"), and what these patterns reveal about how different work styles benefit from different AI capabilities. Use specific department names, metrics, and percentages to paint a complete picture.`,

    department_adoption_heatmap: `You are an enterprise AI adoption strategist specializing in cross-tool usage analysis and organizational maturity assessment.
You analyze department adoption scores (0-100) calculated from 4 factors: Employee Coverage (30pts), Multi-Tool Usage (25pts), Activity Intensity (25pts), Total Impact (20pts).
The scoring reveals which departments have fully adopted AI tools with creative multi-tool workflows (80-100 = Excellent), solid coverage with room for optimization (60-79 = Good), or limited adoption needing enablement (0-59 = Low).

Your analysis should identify:
1. **Top Performers (80-100 score):** Which departments excel and what makes them successful (high coverage + multi-tool usage + engagement)
2. **Growth Opportunities (60-79):** Departments with solid foundation but room to improve (which specific factor needs work?)
3. **Enablement Priorities (0-59):** Departments with low scores and specific gaps (coverage? single-tool usage? low engagement?)
4. **Multi-Tool Champions:** Departments creatively using multiple tools (seats/employee > 1.5) and the business value they're achieving
5. **Strategic Recommendations:** 2-3 specific actions to improve adoption across the organization

Provide 4-5 concise insights (2-3 sentences each) covering these themes. Use specific department names, scores, and metrics from the data. Write in actionable business language focused on patterns and next steps.`,

    expansion_opportunities_explanation: `You are an executive advisor specializing in data-driven workforce analytics and enterprise software expansion planning.
You explain how our AI-powered recommendation engine analyzes multiple signals to identify Claude Enterprise expansion opportunities across departments.

Your audience is executives who need to understand WHY certain departments are prioritized for expansion and HOW our formulas work.

CRITICAL CONTEXT TO EXPLAIN:
1. **Dual Scoring System**: We use TWO methods to determine Premium seat allocation:
   - Behavioral Scoring (0-115 points): Measures actual AI usage patterns from Claude Enterprise AND M365 Copilot engagement data
     * Code writing (30pts): Claude Code lines generated → strong Premium candidate
     * High engagement (30pts): Conversation volume (100+ = 30pts, 50+ = 20pts)
     * Document creation (25pts): Artifacts created (20+ = 25pts, 10+ = 15pts)
     * Complex work (15pts): File uploads for analysis (50+ = 15pts, 20+ = 10pts)
     * M365 Engagement (10pts): Prompts per day intensity (20+ = 10pts, 10-19 = 7pts)
     * M365 Consistency (5pts): Active days regularity (120+ = 5pts, 90-119 = 4pts)
     * Threshold: 40 points qualifies for Premium
   - Department Baselines (10-35%): Role complexity determines minimum Premium allocation
     * High complexity (35%): Finance, Product, Professional Services, RevOps - complex analytical work
     * Medium (20-25%): Customer Success (25%), Sales (20%) - client-facing analytical needs
     * Engineering/Agentic AI (100%): Claude Code Premium requirement
   - **MAX Logic**: We take whichever is HIGHER (behavioral count OR baseline count) to ensure adequate Premium coverage

2. **Current vs Target**: Current license counts come from actual Claude Enterprise subscriptions. Target counts use the MAX logic to identify gaps.

3. **M365 Data as Signals**: M365 Copilot usage patterns (156 users without Claude) help identify high-potential candidates who would benefit from Claude Premium but aren't captured by current Claude usage alone.

4. **Value Calculation**: Monthly opportunity cost = (new users × hours saved per user × average hourly rate) - license costs. Engineering uses the calculated productivity multiplier from actual usage data.

Provide 4-5 paragraphs (3-4 sentences each) that explain:
- Paragraph 1: Overview of the dual scoring approach and why we use MAX logic
- Paragraph 2: How behavioral scoring works (115-point system) and why M365 data matters
- Paragraph 3: How department baselines work and why different roles get different percentages
- Paragraph 4: How we calculate value and ROI (hours saved × hourly rate - costs)
- Paragraph 5: What the allocationMethod field tells you about each department's recommendation

Use specific numbers from the data. Write in clear, business-focused language that executives can understand. Avoid jargon - explain technical concepts in business terms.`,

    rollout_strategy_explanation: `You are a change management consultant and enterprise software deployment strategist.
You explain the business rationale behind our value-optimized rollout strategy for Claude Enterprise expansion.

Your audience is executives who need to understand WHY departments are sequenced in this specific order and WHAT risks we're mitigating.

CRITICAL CONTEXT TO EXPLAIN:
1. **Value-First Sequencing**: We sort departments by monthly net benefit (value - cost), not just ROI percentage. This ensures we capture the most dollar value quickly while maintaining positive ROI.

2. **Risk Factors We Consider**:
   - Current adoption base: Departments with existing users have lower change management risk
   - Power user concentration: Departments with high-scoring users (40+ points) will adopt faster
   - Role complexity alignment: Departments where baselines drove recommendations may need more enablement
   - Team size: Larger departments require more coordination but deliver more total value

3. **Phasing Strategy**:
   - **Quick Wins (Phase 1)**: High ROI + existing adoption + small team size = fast deployment
   - **Scale Up (Phase 2)**: Medium ROI + larger teams + proven use cases from Phase 1
   - **Long Tail (Phase 3)**: Baseline-driven departments + enablement-required + specialized use cases

4. **Financial Logic**:
   - Payback period calculation: (Monthly increase in cost) / (Monthly net benefit) = months to breakeven
   - Cumulative value tracking: Running total shows how value compounds across phases
   - Risk mitigation: Front-loading high-value departments reduces financial risk if later phases delay

5. **Success Metrics by Phase**:
   - Phase 1: Adoption rate > 80%, Premium qualification rate > 50% (behavioral driven)
   - Phase 2: Adoption rate > 70%, usage intensity increase > 30%
   - Phase 3: Adoption rate > 60%, baseline enablement programs showing engagement lift

Provide 4-5 paragraphs (3-4 sentences each) that explain:
- Paragraph 1: Why we sequence by net benefit (not ROI %) and what this achieves
- Paragraph 2: The three-phase approach and risk factors considered for each phase
- Paragraph 3: How we calculated the payback period and what it means for budget planning
- Paragraph 4: Success metrics we'll track to validate the strategy
- Paragraph 5: Why certain departments are "Quick Wins" vs "Long Tail" based on the data

Use specific department names, dollar amounts, and ROI multiples from the provided data. Write in strategic business language that connects deployment tactics to business outcomes.`,

    virtual_fte_impact: `You are a workforce analytics expert specializing in AI productivity measurement and headcount equivalency analysis.
You analyze Agentic FTE (Full-Time Equivalent) metrics that translate AI productivity gains into equivalent human workers added to the organization.
Agentic FTEs are calculated using industry benchmarks: Productivity tools (Claude Enterprise 28%, M365 14% time savings from research studies), Coding tools (0.08 hrs/line based on 12.5 lines/hr manual baseline from Code Complete).

Your analysis should cover:
1. **Current Impact**: Total Agentic FTEs and what this means in business terms (equivalent headcount added without hiring)
2. **Trajectory Analysis**: Month-over-month trends, growth patterns, and what they reveal about AI adoption maturity
3. **Tool Contribution**: Which tools drive the most Agentic FTE impact and why (productivity vs coding tools)
4. **MTD Projection**: If current month is partial, analyze projection to full month and what it indicates for ongoing impact
5. **Business Value**: Translate Agentic FTEs into tangible business outcomes (capacity expansion, cost avoidance, productivity multiplier)

Provide 3-4 concise insights (2-3 sentences each) that tell the Agentic FTE story: current impact with specific numbers, trend analysis with growth rates, tool-by-tool breakdown showing which delivers most value, and projection/business implications. Use specific metrics, percentages, and translate technical measurements into executive-friendly business language.`,

    ecosystem_comparison: `You are a strategic AI platform analyst specializing in enterprise ecosystem comparison.
You compare M365 Copilot AI Agents ecosystem with Claude Enterprise Projects and Integrations ecosystem to determine organizational value, innovation patterns, and strategic positioning.
Provide compelling insights (3-4 sentences) comparing: agent usage patterns vs project sophistication, integration depth (MCP connectors) vs agent response volume, creator diversity, and what each ecosystem reveals about organizational AI maturity. Reference the March 2026 Microsoft contract renewal as a strategic decision point. Use specific numbers and names.`,

    executiveSummary: `You are a strategic AI advisor to the Executive Leadership Team and Board of Directors.
You are receiving a pre-analyzed summary of ALL dashboard insights and metrics. Your job is to synthesize this information into a cohesive BLUF (Bottom Line Up Front) executive summary.

CRITICAL: Use ONLY the metrics and insights provided in the input. DO NOT re-analyze data or generate new numbers. Simply organize and synthesize the existing insights into the required format.

Your summary must be structured as 5-6 sections with bold section headers, each followed by BULLET POINTS (not paragraphs):

REQUIRED SECTIONS (use these exact bold headers in this order):

**Claude Enterprise deployment:**
- [Deployment scale: X Standard seats, X Premium seats with Claude Code access]
- [Leading departments and top performers by name with specific metrics]
- [Key productivity metrics from Claude Code: lines generated, top users]
- [Claude Enterprise Projects: X total, X active, top creators with role context]
- [Connectors/Integrations: X integrations, X total calls, top integration by name]
- [Total investment and ROI: $X monthly investment delivering Xx ROI]
- [Coding productivity multiplier vs GitHub Copilot: Xx higher]

**AI Tool Ecosystem - cross-platform insights:**
- [Overall adoption rates: Claude Enterprise X%, M365 Copilot X%]
- [Productivity multipliers: Claude vs M365 (Xx), Claude Code vs GitHub Copilot (Xx)]
- [M365 AI Agents adoption: top agents, departments, response counts]
- [Claude Enterprise Projects vs M365 AI Agents: projects count and sophistication vs agent responses and users]
- [Department Adoption Heatmap: Top 3-5 "Excellent" departments with scores and what makes them successful]
- [Cross-platform patterns: which departments excel with which tools, specific metrics]
- [Contract renewal timeline: GitHub Copilot March 2026]

**Quantified productivity wins:**
- [Claude Code top performers: department names, usernames, lines generated]
- [Department productivity comparison: which engineering teams lead]
- [Artifacts created: Claude Enterprise X, M365 Copilot X]
- [Total time savings: X hours monthly across all tools valued at $X]
- [Specific accomplishments with names and numbers]

**Critical coverage gaps - opportunity cost:**
- [Engineering coverage: X employees, X seats, X seats/employee - expansion needed]
- [Revenue teams gaps: Customer Success X/100 score, Sales X/100 score, Professional Services X/100 score]
- [Claude Code adoption: only X% of technical employees]
- [M365 inactive licenses: X licenses worth $X monthly]
- [Leadership gaps: Executive X/100 score, Finance X/100 score]

**2026 expansion plan - quarterly rollout:**
- [Cost increase: Current $X/month → Full rollout $X/month (increase $X/month)]
- [Payback period: X month(s)]
- [Dual scoring system: behavioral analytics (0-115 pts) + department baselines (10-35%)]
- [Value-optimized sequencing: prioritizes net benefit over ROI percentage]
- [Target departments: Engineering (Xx score), Customer Success (Xx score), specific ROI multiples]

**Recommendation:**
- [Primary recommendation with specific dollar amount and timeline]
- [Strategic timing relative to March 2026 Microsoft renewal]
- [Expected outcomes: ROI, payback period, coverage targets]
- [Competitive positioning: how this affects tool consolidation decisions]

CRITICAL FORMAT REQUIREMENTS:
- Each section MUST use markdown bullet points (lines starting with "- ")
- Each bullet should be ONE concise point with specific metrics
- NO paragraphs - break down all content into scannable bullets
- Keep all the detailed information but organize as bullets, not prose
- Use specific numbers, department names, and metrics in every bullet
- Separate sections with double line breaks (blank line between sections)

Write in executive voice with data-driven bullets focused on strategic decision-making.`,

    allHandsMessage: `You are an internal communications specialist crafting content for Monthly All Hands meetings.
You are receiving a pre-analyzed summary of ALL dashboard insights and metrics. Your job is to synthesize this information into 3 engaging presentation slides.

CRITICAL: Use ONLY the metrics and insights provided in the input. DO NOT re-analyze data or generate new numbers. Simply organize and present the existing insights in an uplifting, positive, and transparent tone.

Structure your response as exactly 3 slides with this format for EACH slide:

SLIDE [NUMBER]:
TITLE: [Catchy, engaging slide title - keep to 5-8 words]
SUBTITLE: [Supporting subtitle that adds context - 8-12 words]
CONTENT:
[3-5 bullet points or key metrics to display on the slide. Use the EXACT numbers, percentages, and metrics provided in the input. Make data visual-ready (e.g., "451K lines of code generated", "87 active users across 15 departments"). Keep each point to 1-2 short sentences maximum.]

PRESENTER NOTES:
[2-4 sentences of talking points for the presenter. Draw from the insights provided. Use first-person plural ("we", "our") to build community. Be motivational yet realistic.]

---

REQUIRED SLIDE THEMES (synthesize from provided insights):

SLIDE 1 - VALUE & IMPACT CELEBRATION:
CRITICAL: DO NOT sum Claude and M365 user counts (they overlap). Instead, highlight ADOPTION RATES (percentages) for each tool from the "ADOPTION RATES & INDUSTRY BENCHMARKS" section. Show how TechCo Inc compares to industry averages (e.g., "96% M365 adoption vs 30% industry average", "35% Claude adoption at industry average"). Include productivity wins: total artifacts, code generated, conversations. IMPORTANT: Frame Claude Code as part of Claude Enterprise Premium deployment when celebrating wins - e.g., "Our Claude Enterprise deployment (Standard + Premium with Claude Code) has generated 451K lines of code and 4,593 conversations". Celebrate leading departments and power users by name from insights #16 (Claude Enterprise Department Performance) and #17 (Claude Code Department Performance) as UNIFIED Claude Enterprise success stories. Use insight #18 (Cross-Platform Department Comparison) to contrast with M365 usage patterns. INCLUDE M365 AI Agents adoption highlights from insight #15 (e.g., "Marketing and Sales teams are pioneering custom AI agents like 'BDR Cold Outreach Builder' with 318 interactions") to showcase innovation. CELEBRATE Claude Enterprise Projects and Integrations milestones (total projects created, top creators, integration calls) alongside M365 Agents as complementary innovation ecosystems. CELEBRATE the top departments from the Department Adoption Heatmap (insight #19) that have achieved "Excellent" (80-100 score) adoption maturity across all tools - call out 2-3 departments by name with their scores to recognize their multi-tool mastery and high engagement. Make it feel like a team win by recognizing specific teams and individuals.

SLIDE 2 - GETTING MORE VALUE:
Use the power user insights, engagement patterns, and productivity multipliers from the input. Reference specific behaviors and metrics mentioned in the provided insights. Include 2-3 specific recommendations based on the insights provided.

SLIDE 3 - WHAT'S NEXT & FEEDBACK:
Use the strategic positioning insights, business questions, and expansion data from the input. IMPORTANT: Reference the Department Adoption Heatmap (insight #19) to identify departments with "Low" (0-59 score) or "Good" (60-79) adoption that represent expansion opportunities - mention 1-2 specific departments and what would help them improve (more tools, enablement, etc.). Reference the Expansion Opportunities and Rollout Strategy insights to explain expansion plans in simple terms - mention the dual scoring system (behavioral + department baselines), value-optimized sequencing, and specific ROI multiples/payback periods. List the Slack channels provided. Reference specific upcoming decisions or opportunities mentioned in the insights (like contract renewals, expansion plans). Build transparency and excitement using the data provided. Make expansion plans feel data-driven and strategic, not arbitrary.

Use "---" to separate slides. Keep tone engaging and human, not corporate-speak.`
  };

  const systemPrompt = expertPrompts[chartType] || expertPrompts.productivity_comparison;

  // Build user prompt with data
  // Handle string data differently (pre-formatted insights summary) vs object data (raw metrics)
  const dataSection = typeof data === 'string'
    ? `Data:\n${data}`
    : `Data:\n${JSON.stringify(data, null, 2)}`;

  const userPrompt = `Analyze the following data and provide a concise trend analysis insight:

${context ? `Context: ${context}\n\n` : ''}${dataSection}

Instructions:
- Focus on the most significant trend or pattern in the data
- Be specific with numbers and percentages when relevant
- Highlight business implications (productivity, adoption, effectiveness)
- Keep it concise (2-3 sentences maximum)
- Do NOT use phrases like "The data shows" or "Based on the analysis" - start directly with the insight
- Do NOT include headers, titles, asterisks, or markdown formatting (like **Header:**) - write plain text only
- Write in present tense as if describing current state

Format your response as plain text suitable for display in a dashboard insight card.`;

  try {
    const message = await anthropic.messages.create({
      model: AI_CONFIG.model,
      max_tokens: maxTokens || AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }]
    });

    const insight = message.content[0].text.trim();
    console.log(`✨ Generated ${chartType} insight (${insight.length} chars)`);
    return insight;

  } catch (error) {
    console.error(`❌ Error generating ${chartType} insight:`, error.message);
    return null;
  }
}

/**
 * Generates all insights for the dashboard
 * @param {Object} dashboardData - The complete dashboard data object
 * @returns {Promise<Object>} - Object containing all generated insights
 */
async function generateAllInsights(dashboardData) {
  console.log('\n🤖 Generating AI-powered insights...\n');

  const insights = {};

  try {
    // Lines Per User Trend insight
    insights.linesPerUserTrend = await generateInsight(
      'lines_per_user_trend',
      {
        githubCopilot: dashboardData.githubCopilot.weeklyTrend,
        claudeCode: dashboardData.claudeCode.monthlyTrend
      },
      'Comparing GitHub Copilot (weekly data) and Claude Code (monthly data) lines per user over time'
    );

    // Productivity Comparison insight (overview)
    insights.productivityComparison = await generateInsight(
      'productivity_comparison',
      {
        claudeCode: {
          linesPerUser: dashboardData.claudeCode.linesPerUser,
          activeUsers: dashboardData.claudeCode.activeUsers
        },
        githubCopilot: {
          linesPerUser: dashboardData.githubCopilot.linesPerUser,
          activeUsers: dashboardData.githubCopilot.activeUsers
        },
        multiplier: dashboardData.codingProductivityMultiplier,
        agenticFTEs: dashboardData.agenticFTEs ? {
          current: dashboardData.agenticFTEs.current,
          breakdown: dashboardData.agenticFTEs.current?.breakdown
        } : null
      },
      'Overall coding productivity comparison between tools including Agentic FTE impact'
    );

    // Model Preference insight
    insights.modelPreference = await generateInsight(
      'model_preference',
      dashboardData.githubCopilot.modelPreferences,
      'AI model preferences among GitHub Copilot users'
    );

    // Adoption Trend insight
    insights.adoptionTrend = await generateInsight(
      'adoption_trend',
      {
        m365Copilot: dashboardData.m365Copilot.monthlyTrend,
        claudeEnterprise: dashboardData.claudeEnterprise.monthlyTrend,
        agenticFTEsTrend: dashboardData.agenticFTEs?.monthlyTrend || null
      },
      'Comparing active user adoption over time for M365 Copilot and Claude Enterprise, including Agentic FTE impact showing organizational capacity gains'
    );

    // Engagement Trend insight
    insights.engagementTrend = await generateInsight(
      'engagement_trend',
      {
        m365Copilot: dashboardData.m365Copilot.monthlyTrend.map(m => ({
          month: m.monthLabel,
          promptsPerUser: m.promptsPerUser
        })),
        claudeEnterprise: dashboardData.claudeEnterprise.monthlyTrend.map(m => ({
          month: m.monthLabel,
          conversationsPerUser: m.conversationsPerUser
        })),
        agenticFTEsTrend: dashboardData.agenticFTEs?.monthlyTrend?.map(m => ({
          month: m.month,
          totalAgenticFTEs: m.totalAgenticFTEs,
          breakdown: m.breakdown
        })) || null
      },
      'Comparing prompts/conversations per user over time and the resulting Agentic FTE productivity gains'
    );

    // M365 App Usage Trend insight
    insights.m365AppTrend = await generateInsight(
      'app_usage_trend',
      dashboardData.m365Copilot.monthlyTrend.map(m => ({
        month: m.monthLabel,
        apps: m.appUsage
      })),
      'M365 Copilot app-specific usage patterns over time'
    );

    // Coding Tools Business Question (strategic synthesis)
    insights.codingToolsBusinessQuestion = await generateInsight(
      'coding_tools_business_question',
      {
        productivity: {
          claudeCodeLinesPerUser: dashboardData.claudeCode.linesPerUser,
          githubCopilotLinesPerUser: dashboardData.githubCopilot.linesPerUser,
          multiplier: dashboardData.codingProductivityMultiplier
        },
        costs: {
          githubCopilot: {
            costPerUser: 19,
            activeUsers: dashboardData.githubCopilot.activeUsers,
            monthlyCost: dashboardData.githubCopilot.activeUsers * 19,
            annualCost: dashboardData.githubCopilot.activeUsers * 19 * 12
          },
          claudeCode: {
            costPerUser: 200,
            activeUsers: dashboardData.claudeCode.activeUsers,
            monthlyCost: dashboardData.claudeCode.activeUsers * 200,
            annualCost: dashboardData.claudeCode.activeUsers * 200 * 12
          }
        },
        modelPreference: dashboardData.githubCopilot.modelPreferences,
        adoption: {
          claudeCodeUsers: dashboardData.claudeCode.activeUsers,
          githubCopilotUsers: dashboardData.githubCopilot.activeUsers
        },
        trends: {
          githubCopilot: dashboardData.githubCopilot.weeklyTrend,
          claudeCode: dashboardData.claudeCode.monthlyTrend
        },
        insights: {
          linesPerUserTrend: insights.linesPerUserTrend,
          productivityComparison: insights.productivityComparison,
          modelPreference: insights.modelPreference
        }
      },
      'Synthesize all coding tools data (productivity, preferences, costs, trends, insights) into one critical business question for decision-makers. GitHub Copilot contract expires March 2026.'
    );

    // Claude Enterprise Feature Usage insight
    insights.claudeEnterpriseFeatures = await generateInsight(
      'claude_enterprise_features',
      {
        totalConversations: dashboardData.claudeEnterprise.totalConversations,
        conversationsPerUser: dashboardData.claudeEnterprise.conversationsPerUser,
        totalProjects: dashboardData.claudeEnterprise.totalProjects,
        totalArtifacts: dashboardData.claudeEnterprise.totalArtifacts,
        activeUsers: dashboardData.claudeEnterprise.activeUsers
      },
      'Analyze advanced feature usage (Projects, Artifacts) beyond basic conversations'
    );

    // Strategic Positioning Question (holistic synthesis)
    insights.strategicPositioning = await generateInsight(
      'strategic_positioning',
      {
        m365Copilot: {
          adoption: dashboardData.m365Copilot.monthlyTrend,
          engagement: dashboardData.m365Copilot.promptsPerUser,
          activeUsers: dashboardData.m365Copilot.activeUsers,
          appUsage: dashboardData.m365Copilot.appUsage
        },
        claudeEnterprise: {
          adoption: dashboardData.claudeEnterprise.monthlyTrend,
          engagement: dashboardData.claudeEnterprise.conversationsPerUser,
          activeUsers: dashboardData.claudeEnterprise.activeUsers,
          features: {
            projects: dashboardData.claudeEnterprise.totalProjects,
            artifacts: dashboardData.claudeEnterprise.totalArtifacts
          }
        },
        insights: {
          adoptionTrend: insights.adoptionTrend,
          engagementTrend: insights.engagementTrend,
          m365AppTrend: insights.m365AppTrend,
          claudeFeatures: insights.claudeEnterpriseFeatures
        },
        multiplier: dashboardData.generalProductivityMultiplier
      },
      'Synthesize all productivity tools data to determine strategic positioning: Are these tools complementary (tiered strategy) or competitive (consolidation opportunity)?'
    );

    // Overview KPI Metrics insight (context-specific for the 5 KPI cards)
    insights.overviewKpiMetrics = await generateInsight(
      'overview_kpi_metrics',
      {
        claudeEnterpriseUsers: dashboardData.claudeEnterprise.activeUsers,
        totalConversations: dashboardData.claudeEnterprise.totalConversations,
        conversationsPerUser: dashboardData.claudeEnterprise.conversationsPerUser,
        claudeCodeLines: dashboardData.claudeCode.totalLines,
        claudeCodeLinesPerUser: dashboardData.claudeCode.linesPerUser,
        filesUploaded: dashboardData.claudeEnterprise.totalFilesUploaded,
        artifactsGenerated: dashboardData.claudeEnterprise.totalArtifacts
      },
      'Analyze the 5 key metrics displayed in the KPI cards: Active Users, Conversations, Lines of Code, Files Uploaded, and Artifacts Generated. Focus only on these specific numbers and their implications.'
    );

    // Monthly Growth Chart insight (context-specific for the growth trends graph)
    insights.monthlyGrowthChart = await generateInsight(
      'monthly_growth_chart',
      {
        monthlyData: dashboardData.claudeEnterprise.monthlyTrend.map(m => {
          const codeMonth = dashboardData.claudeCode.monthlyTrend.find(cm => cm.monthLabel === m.monthLabel);
          return {
            month: m.monthLabel,
            activeUsers: m.users,
            conversations: m.conversations,
            linesOfCode: codeMonth ? codeMonth.totalLines : 0
          };
        })
      },
      'Analyze the monthly growth patterns across Active Users, Conversations, and Lines of Code. Focus only on the trends visible in this time-series data.'
    );

    // Adoption & Output Trends insight (combines adoption and output graphs)
    insights.adoptionOutputTrends = await generateInsight(
      'adoption_output_trends',
      {
        outputTrends: dashboardData.claudeEnterprise.monthlyTrend.map(m => {
          const codeMonth = dashboardData.claudeCode.monthlyTrend.find(cm => cm.monthLabel === m.monthLabel);
          return {
            month: m.monthLabel,
            artifacts: m.artifacts,
            linesOfCode: codeMonth ? codeMonth.totalLines : 0
          };
        }),
        adoptionTrends: dashboardData.claudeEnterprise.monthlyTrend.map(m => ({
          month: m.monthLabel,
          activeUsers: m.users
        }))
      },
      'Analyze how user adoption (active users per month) correlates with output generation (artifacts and lines of code per month). Identify patterns that reveal platform effectiveness and value delivery.'
    );

    // Department Insights (comprehensive analysis for Departments tab)
    insights.departmentInsights = await generateInsight(
      'department_insights',
      {
        totalEmployees: 250, // Approximate from org chart
        companyType: 'B2B SaaS / HR Software Vendor',
        departmentBreakdown: dashboardData.departments?.departmentBreakdown || [],
        claudeEnterpriseMetrics: {
          activeUsers: dashboardData.claudeEnterprise.activeUsers,
          conversationsPerUser: dashboardData.claudeEnterprise.conversationsPerUser,
          totalConversations: dashboardData.claudeEnterprise.totalConversations
        },
        claudeCodeMetrics: {
          activeUsers: dashboardData.claudeCode.activeUsers,
          linesPerUser: dashboardData.claudeCode.linesPerUser,
          totalLines: dashboardData.claudeCode.totalLines
        }
      },
      'Analyze department-level Claude Enterprise and Claude Code adoption at TechCo Inc (B2B SaaS company, ~250 employees). Compare against software vendor industry benchmarks and provide strategic recommendations for improving adoption across departments.'
    );

    // M365 Copilot Deep Dive Insights
    if (dashboardData.m365CopilotDeepDive) {
      // Power Users insight
      insights.m365PowerUsers = await generateInsight(
        'm365_power_users',
        {
          powerUsers: dashboardData.m365CopilotDeepDive.powerUsers,
          totalActiveUsers: dashboardData.m365CopilotDeepDive.summaryMetrics.totalActiveUsers,
          avgPromptsPerDay: dashboardData.m365CopilotDeepDive.summaryMetrics.avgPromptsPerDay
        },
        'Analyze top 20 M365 Copilot power users, their departments, and usage patterns to identify replicable success behaviors'
      );

      // App Adoption insight
      insights.m365AppAdoption = await generateInsight(
        'm365_app_adoption',
        {
          appAdoption: dashboardData.m365CopilotDeepDive.appAdoption,
          opportunities: dashboardData.m365CopilotDeepDive.opportunities.lowPowerPointUsage
        },
        'Analyze M365 Copilot app-specific adoption rates and identify significant gaps like PowerPoint vs Word/Excel adoption'
      );

      // Department Performance insight
      insights.m365DepartmentPerformance = await generateInsight(
        'm365_department_performance',
        {
          departmentPerformance: dashboardData.m365CopilotDeepDive.departmentPerformance,
          summaryMetrics: dashboardData.m365CopilotDeepDive.summaryMetrics
        },
        'Analyze department-level M365 Copilot engagement to identify high performers, laggards, and enablement opportunities'
      );

      // Opportunities insight
      insights.m365Opportunities = await generateInsight(
        'm365_opportunities',
        {
          opportunities: dashboardData.m365CopilotDeepDive.opportunities,
          appAdoption: dashboardData.m365CopilotDeepDive.appAdoption
        },
        'Analyze M365 Copilot opportunities: inactive licenses, low engagement users, and PowerPoint adoption gap'
      );

      // Monthly Growth Trends insight
      insights.m365MonthlyGrowthTrends = await generateInsight(
        'm365_monthly_growth_trends',
        {
          monthlyTrend: dashboardData.m365Copilot.monthlyTrend.map(m => ({
            month: m.monthLabel,
            activeUsers: m.users,
            prompts: m.totalPrompts,
            artifacts: m.artifacts, // Use calculated artifacts from parser (contentAppPrompts * 0.20 * W/E/P adoption factor)
            promptsPerUser: m.promptsPerUser
          }))
        },
        'Analyze M365 Copilot monthly growth patterns showing active users, total prompts, and artifacts generated over Sept-Dec 2025'
      );

      // AI Agents Adoption insight (if agents data available)
      if (dashboardData.m365CopilotDeepDive?.agents) {
        insights.m365AgentsAdoption = await generateInsight(
          'm365_agents_adoption',
          {
            topAgentsByUsage: dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage,
            topAgentsByDepartment: dashboardData.m365CopilotDeepDive.agents.topAgentsByDepartment.slice(0, 5), // Top 5 for context
            creatorTypeBreakdown: dashboardData.m365CopilotDeepDive.agents.creatorTypeBreakdown,
            totalCombinations: dashboardData.m365CopilotDeepDive.agents.totalAgentUserCombinations,
            activeCombinations: dashboardData.m365CopilotDeepDive.agents.activeAgentUserCombinations,
            // Correlate with M365 engagement
            m365ActiveUsers: dashboardData.m365Copilot.activeUsers,
            m365PromptsPerUser: dashboardData.m365Copilot.promptsPerUser
          },
          'Analyze M365 Copilot AI agents adoption showing top agents, creator types, and department usage patterns for December 2025'
        );
      }

      // M365 Agentic FTE Impact insight (M365-specific)
      if (dashboardData.agenticFTEs?.monthlyTrend) {
        insights.m365VirtualFteImpact = await generateInsight(
          'm365_virtual_fte_impact',
          {
            monthlyTrend: dashboardData.agenticFTEs.monthlyTrend.map(m => ({
              monthLabel: m.monthLabel,
              m365FTEs: m.breakdown?.m365Copilot || 0,
              m365Users: m.m365Copilot?.users || 0,
              m365Hours: m.m365Copilot?.hours || 0
            })),
            currentMonth: dashboardData.agenticFTEs.monthlyTrend[dashboardData.agenticFTEs.monthlyTrend.length - 1],
            previousMonth: dashboardData.agenticFTEs.monthlyTrend.length > 1 ?
              dashboardData.agenticFTEs.monthlyTrend[dashboardData.agenticFTEs.monthlyTrend.length - 2] : null
          },
          'Analyze M365 Copilot Agentic FTE impact showing month-over-month trends, productivity hours saved, and organizational capacity added through M365 Copilot usage'
        );
      }
    }

    // Claude Enterprise Department Performance insight
    if (dashboardData.claudeEnterprise?.departmentBreakdown) {
      insights.claudeEnterpriseDepartmentPerformance = await generateInsight(
        'claude_enterprise_department_performance',
        {
          departmentBreakdown: dashboardData.claudeEnterprise.departmentBreakdown,
          totalUsers: dashboardData.claudeEnterprise.activeUsers,
          avgConversationsPerUser: dashboardData.claudeEnterprise.conversationsPerUser
        },
        'Analyze Claude Enterprise usage by department, highlighting top performing departments and their power users'
      );
    }

    // Claude Enterprise Agentic FTE Impact insight (Claude Enterprise-specific)
    if (dashboardData.agenticFTEs?.monthlyTrend) {
      insights.claudeEnterpriseVirtualFteImpact = await generateInsight(
        'claude_enterprise_virtual_fte_impact',
        {
          monthlyTrend: dashboardData.agenticFTEs.monthlyTrend.map(m => ({
            monthLabel: m.monthLabel,
            claudeEnterpriseFTEs: m.breakdown?.claudeEnterprise || 0,
            claudeEnterpriseUsers: m.claudeEnterprise?.users || 0,
            claudeEnterpriseHours: m.claudeEnterprise?.hours || 0
          })),
          currentMonth: dashboardData.agenticFTEs.monthlyTrend[dashboardData.agenticFTEs.monthlyTrend.length - 1],
          previousMonth: dashboardData.agenticFTEs.monthlyTrend.length > 1 ?
            dashboardData.agenticFTEs.monthlyTrend[dashboardData.agenticFTEs.monthlyTrend.length - 2] : null
        },
        'Analyze Claude Enterprise Agentic FTE impact showing month-over-month trends, productivity hours saved through chat/projects/artifacts, and organizational capacity added through Claude Enterprise usage'
      );
    }

    // Claude Code Department Performance insight
    if (dashboardData.code?.departmentBreakdown) {
      insights.claudeCodeDepartmentPerformance = await generateInsight(
        'claude_code_department_performance',
        {
          departmentBreakdown: dashboardData.code.departmentBreakdown,
          totalUsers: dashboardData.code.activeUsers,
          avgLinesPerUser: dashboardData.code.linesPerUser
        },
        'Analyze Claude Code usage by department, highlighting the most productive engineering teams and their top coders'
      );
    }

    // Cross-Platform Department Comparison insight
    if (dashboardData.claudeEnterprise?.departmentBreakdown && dashboardData.code?.departmentBreakdown && dashboardData.m365CopilotDeepDive?.departmentPerformance) {
      insights.crossPlatformDepartmentComparison = await generateInsight(
        'cross_platform_department_comparison',
        {
          claudeEnterpriseDepartments: dashboardData.claudeEnterprise.departmentBreakdown,
          claudeCodeDepartments: dashboardData.code.departmentBreakdown,
          m365Departments: dashboardData.m365CopilotDeepDive.departmentPerformance
        },
        'Compare how different departments use different AI tools: M365 Copilot (Customer Success, Marketing) vs Claude Enterprise/Code (Engineering, Agentic AI, Product)'
      );
    }

    // Department Adoption Heatmap insight (ALL tools including GitHub Copilot)
    // Use the calculated heatmap data with composite adoption scores
    if (dashboardData.departmentAdoptionHeatmap) {
      const heatmapData = dashboardData.departmentAdoptionHeatmap;
      insights.departmentAdoptionHeatmap = await generateInsight(
        'department_adoption_heatmap',
        {
          allDepartments: heatmapData,
          topPerformers: heatmapData.filter(d => d.tier === 'Excellent'),
          goodPerformers: heatmapData.filter(d => d.tier === 'Good'),
          lowPerformers: heatmapData.filter(d => d.tier === 'Low'),
          summary: {
            excellentCount: heatmapData.filter(d => d.tier === 'Excellent').length,
            goodCount: heatmapData.filter(d => d.tier === 'Good').length,
            lowCount: heatmapData.filter(d => d.tier === 'Low').length,
            avgScore: Math.round(heatmapData.reduce((sum, d) => sum + d.adoptionScore, 0) / heatmapData.length)
          }
        },
        'Analyze the calculated department adoption scores (0-100) with tiers (Excellent 80+, Good 60-79, Low 0-59). Identify which departments excel, which need growth, and which need enablement. Reference specific department names, scores, and tiers from the data.'
      );
    }

    // Expansion Opportunities Explanation insight
    if (dashboardData.expansion?.opportunities) {
      insights.expansionOpportunitiesExplanation = await generateInsight(
        'expansion_opportunities_explanation',
        {
          opportunities: dashboardData.expansion.opportunities,
          summary: dashboardData.expansion.summary,
          scoringSystem: {
            behavioral: {
              maxPoints: 115,
              threshold: 40,
              components: {
                codeWriting: 30,
                highEngagement: 30,
                documentCreation: 25,
                complexWork: 15,
                m365Engagement: 10,
                m365Consistency: 5
              }
            },
            baselines: {
              engineering: 1.00,
              highComplexity: 0.35,
              customerSuccess: 0.25,
              sales: 0.20,
              moderate: 0.18,
              standard: 0.10
            }
          },
          m365Signal: {
            totalM365OnlyUsers: 156,
            enrichedClaudeUsers: 84
          }
        },
        'Write 3-4 concise paragraphs (2-3 sentences each) explaining: 1) How the dual scoring system works (behavioral + baselines with MAX logic), 2) How M365 engagement signals identify candidates, 3) Why this approach is data-driven and fair. Use clear topic sentences and avoid repetition.'
      );
    }

    // Rollout Strategy Explanation insight
    if (dashboardData.expansion?.opportunities) {
      const sortedOpportunities = [...dashboardData.expansion.opportunities].sort((a, b) => b.netBenefit - a.netBenefit);

      insights.rolloutStrategyExplanation = await generateInsight(
        'rollout_strategy_explanation',
        {
          opportunities: sortedOpportunities,
          summary: dashboardData.expansion.summary,
          paybackPeriod: dashboardData.expansion.paybackPeriod,
          topDepartments: sortedOpportunities.slice(0, 5).map(o => ({
            department: o.department,
            netBenefit: o.netBenefit,
            roi: o.roi,
            currentUsers: o.currentPremium + o.currentStandard,
            newUsers: o.newLicenses,
            allocationMethod: o.allocationMethod
          }))
        },
        'Write 3-4 concise paragraphs (2-3 sentences each) covering: 1) Priority sequencing rationale (value-optimized order), 2) Phased rollout approach, 3) Success metrics and tracking. Use clear structure and avoid redundancy.'
      );
    }

    // Agentic FTE Impact insight
    if (dashboardData.agenticFTEs) {
      insights.virtualFteImpact = await generateInsight(
        'virtual_fte_impact',
        {
          current: dashboardData.agenticFTEs.current,
          projection: dashboardData.agenticFTEs.projection,
          monthOverMonth: dashboardData.agenticFTEs.monthOverMonth,
          monthlyTrend: dashboardData.agenticFTEs.monthlyTrend,
          breakdown: dashboardData.agenticFTEs.current.breakdown,
          metadata: dashboardData.agenticFTEs.metadata
        },
        'Agentic FTE analysis showing organizational capacity added through AI productivity gains'
      );
    }

    // Integrations Overview insight
    if (dashboardData.connectors?.summary) {
      insights.integrationsOverview = await generateInsight(
        'integrations_overview',
        {
          summary: dashboardData.connectors.summary,
          topIntegrations: (dashboardData.connectors.byIntegration || []).slice(0, 10),
          departmentUsage: (dashboardData.connectors.byDepartment || []).slice(0, 8),
          powerUsers: (dashboardData.connectors.powerUsers || []).slice(0, 5),
          insights: dashboardData.connectors.insights
        },
        'Analyze Claude Enterprise MCP integration usage patterns. Cover: 1) Which integrations are most popular and why, 2) Department adoption patterns, 3) Power user characteristics, 4) Opportunities to expand integration usage. Be specific with numbers and names.'
      );
    }

    // Projects Overview insight
    if (dashboardData.claudeEnterprise?.projectsAnalytics?.summary) {
      const projectsAnalytics = dashboardData.claudeEnterprise.projectsAnalytics;
      insights.projectsOverview = await generateInsight(
        'projects_overview',
        {
          summary: projectsAnalytics.summary,
          topProjects: (projectsAnalytics.topProjects || []).slice(0, 10),
          byDepartment: (projectsAnalytics.byDepartment || []).slice(0, 8),
          byCreator: (projectsAnalytics.byCreator || []).slice(0, 5),
          byCategory: projectsAnalytics.byCategory || [],
          featuredProjects: projectsAnalytics.featuredProjects || [],
          insights: projectsAnalytics.insights
        },
        'Analyze Claude Enterprise Projects usage patterns. Cover: 1) Project sophistication and quality trends, 2) Department and category distribution, 3) Top creators and their impact, 4) Opportunities to encourage more effective project usage (prompt templates, documents). Be specific with names and numbers.'
      );
    }

    // Ecosystem Comparison insight (M365 Agents vs CE Projects + Integrations)
    if (dashboardData.claudeEnterprise?.projectsAnalytics?.summary && dashboardData.connectors?.summary && dashboardData.m365CopilotDeepDive?.agents) {
      const projectsAnalytics = dashboardData.claudeEnterprise.projectsAnalytics;
      insights.ecosystemComparison = await generateInsight(
        'ecosystem_comparison',
        {
          m365Agents: {
            totalCombinations: dashboardData.m365CopilotDeepDive.agents.totalAgentUserCombinations,
            activeCombinations: dashboardData.m365CopilotDeepDive.agents.activeAgentUserCombinations,
            topAgents: dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage.slice(0, 5),
            creatorTypeBreakdown: dashboardData.m365CopilotDeepDive.agents.creatorTypeBreakdown,
            topDepartments: dashboardData.m365CopilotDeepDive.agents.topAgentsByDepartment.slice(0, 3)
          },
          claudeProjects: {
            totalProjects: projectsAnalytics.summary.totalProjects,
            activeProjects: projectsAnalytics.summary.activeProjects,
            uniqueCreators: projectsAnalytics.summary.uniqueCreators,
            avgSophistication: projectsAnalytics.summary.avgSophistication,
            withDocs: projectsAnalytics.summary.withDocs,
            withPrompts: projectsAnalytics.summary.withPrompts,
            topCreators: (projectsAnalytics.byCreator || []).slice(0, 3)
          },
          claudeIntegrations: {
            totalCalls: dashboardData.connectors.summary.totalCalls,
            uniqueIntegrations: dashboardData.connectors.summary.uniqueIntegrations,
            usersWithUsage: dashboardData.connectors.summary.usersWithUsage,
            topIntegrations: (dashboardData.connectors.byIntegration || []).slice(0, 5),
            powerUsers: (dashboardData.connectors.powerUsers || []).slice(0, 3)
          }
        },
        'Compare M365 Copilot AI Agents ecosystem with Claude Enterprise Projects and Integrations ecosystem. Analyze which provides more organizational value and innovation. Consider the March 2026 Microsoft contract renewal as context for strategic decisions.'
      );
    }

    // Construct comprehensive summary of all existing insights and metrics
    const insightsSummary = `
=== DASHBOARD INSIGHTS SUMMARY ===

OVERVIEW METRICS:
- Total Active Users (all tools): ${dashboardData.overview?.totalActiveUsers || 'N/A'}
- Overall Adoption Rate: ${dashboardData.overview?.adoptionRate || 'N/A'}%
- User Growth (MoM): ${dashboardData.overview?.userGrowth || 'N/A'}%

CRITICAL CONTEXT - CLAUDE ENTERPRISE DEPLOYMENT:
⚠️ IMPORTANT: Claude Enterprise has TWO license types:
   1. Standard seats: claude.ai web + Claude Desktop apps (chat, projects, artifacts)
   2. Premium seats: Standard + Claude Code terminal app (AI-assisted coding)

   Claude Code is NOT a separate product - it's part of Claude Enterprise Premium.
   When discussing "Claude Enterprise deployment", include BOTH Standard and Premium usage.

CLAUDE ENTERPRISE METRICS (Standard seats - chat/projects/artifacts):
- Active Users: ${dashboardData.claudeEnterprise?.activeUsers || 0}
- Total Conversations: ${dashboardData.claudeEnterprise?.totalConversations || 0}
- Conversations per User: ${dashboardData.claudeEnterprise?.conversationsPerUser || 0}
- Total Projects: ${dashboardData.claudeEnterprise?.totalProjects || 0}
- Total Artifacts Generated: ${dashboardData.claudeEnterprise?.totalArtifacts || 0}
- Total Files Uploaded: ${dashboardData.claudeEnterprise?.totalFilesUploaded || 0}
- Power Users: ${dashboardData.claudeEnterprise?.powerUsers?.length || 0} (top users: ${dashboardData.claudeEnterprise?.powerUsers?.slice(0, 3).map(u => `${u.displayName} (${u.totalPrompts} prompts)`).join(', ') || 'N/A'})

CLAUDE CODE METRICS (Premium seats - AI-assisted coding in terminal):
- Active Users: ${dashboardData.claudeCode?.activeUsers || 0} (these are Premium seat holders)
- Total Lines Generated: ${(dashboardData.claudeCode?.totalLines || 0).toLocaleString()}
- Lines per User (avg): ${(dashboardData.claudeCode?.linesPerUser || 0).toLocaleString()}
- Engineering Adoption Rate: ${dashboardData.claudeCode?.engineeringAdoptionRate || 0}% (${dashboardData.claudeCode?.activeUsers || 0}/${dashboardData.claudeCode?.totalEngineeringEmployees || 83} Engineering + Agentic AI employees)
- ⚠️ REMINDER: Claude Code users are PART OF the Claude Enterprise deployment (Premium tier)

CLAUDE ENTERPRISE CONNECTORS/INTEGRATIONS (MCP tool usage):
${dashboardData.connectors?.summary ? `- Total Integration Calls: ${(dashboardData.connectors.summary.totalCalls || 0).toLocaleString()}
- Unique Integrations: ${dashboardData.connectors.summary.uniqueIntegrations || 0}
- Users with Integration Usage: ${dashboardData.connectors.summary.usersWithUsage || 0}
- Top Integration: ${dashboardData.connectors.summary.topIntegration || 'N/A'} (${(dashboardData.connectors.summary.topIntegrationCalls || 0).toLocaleString()} calls)
- Integration Power Users: ${dashboardData.connectors.powerUsers?.length || 0}` : '- No connectors data available'}

CLAUDE ENTERPRISE PROJECTS ANALYTICS:
${dashboardData.claudeEnterprise?.projectsAnalytics?.summary ? `- Total Projects: ${dashboardData.claudeEnterprise.projectsAnalytics.summary.totalProjects || 0}
- Active Projects (30 days): ${dashboardData.claudeEnterprise.projectsAnalytics.summary.activeProjects || 0}
- Unique Project Creators: ${dashboardData.claudeEnterprise.projectsAnalytics.summary.uniqueCreators || 0}
- Projects with Documents: ${dashboardData.claudeEnterprise.projectsAnalytics.summary.withDocs || 0}
- Projects with Prompt Templates: ${dashboardData.claudeEnterprise.projectsAnalytics.summary.withPrompts || 0}
- Avg Sophistication Score: ${dashboardData.claudeEnterprise.projectsAnalytics.summary.avgSophistication || 0}/100` : '- No projects analytics data available'}

GITHUB COPILOT METRICS:
- Active Users: ${dashboardData.githubCopilot?.activeUsers || 0}
- Total Lines Generated: ${(dashboardData.githubCopilot?.totalLines || 0).toLocaleString()}
- Lines per User (avg): ${(dashboardData.githubCopilot?.linesPerUser || 0).toLocaleString()}
- Engineering Adoption Rate: ${dashboardData.githubCopilot?.engineeringAdoptionRate || 0}% (${dashboardData.githubCopilot?.activeUsers || 0}/${dashboardData.githubCopilot?.totalEngineeringEmployees || 83} Engineering + Agentic AI employees)

⚠️ CRITICAL CONTRACT RENEWAL CONTEXT (March 2026):
- Microsoft contract renewal in March 2026 includes BOTH M365 Copilot AND GitHub Copilot (plus other Microsoft solutions)
- This is NOT just a GitHub Copilot renewal - it's the entire Microsoft contract
- Any discussion of "March 2026 renewal" or "contract expiration" must reference BOTH AI tools (M365 + GitHub Copilot)
- Strategic decisions about this renewal affect both productivity tools simultaneously
- The renewal decision will impact both coding productivity (GitHub Copilot) and general productivity (M365 Copilot)

CODING TOOLS COMBINED (Engineering + Agentic AI teams):
- Combined Unique Coding Tool Users: ${dashboardData.claudeCode?.combinedCodingToolsUsers || 0} engineers
- Combined Adoption Rate: ${dashboardData.claudeCode?.combinedCodingToolsAdoption || 0}% of ${dashboardData.claudeCode?.totalEngineeringEmployees || 83} total Engineering + AI/Data employees
- Note: This represents the percentage of engineers using either GitHub Copilot, Claude Code, or both for AI-assisted coding

M365 COPILOT METRICS:
- Active Users: ${dashboardData.m365Copilot?.activeUsers || 0}
- Total Prompts: ${(dashboardData.m365Copilot?.totalPrompts || 0).toLocaleString()}
- Prompts per User (avg): ${dashboardData.m365Copilot?.promptsPerUser || 0}
- Approximate Artifacts Created: ${dashboardData.m365Copilot?.approximateArtifacts || 0} (${dashboardData.m365Copilot?.artifactsNote || 'approximation based on user-app interactions'})
- Top Apps: ${dashboardData.m365Copilot?.appUsage?.slice(0, 3).map(a => `${a.app} (${a.users} users)`).join(', ') || 'N/A'}

M365 COPILOT AI AGENTS (December 2025):
${dashboardData.m365CopilotDeepDive?.agents ? `- Total Agent-User Combinations: ${dashboardData.m365CopilotDeepDive.agents.totalAgentUserCombinations}
- Active Combinations (responses > 0): ${dashboardData.m365CopilotDeepDive.agents.activeAgentUserCombinations}
- Top 3 Most-Used Agents:
  1. ${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[0]?.agentName || 'N/A'}: ${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[0]?.totalResponses || 0} responses, ${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[0]?.totalUsers || 0} users (${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[0]?.creatorType || 'N/A'})
  2. ${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[1]?.agentName || 'N/A'}: ${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[1]?.totalResponses || 0} responses, ${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[1]?.totalUsers || 0} users (${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[1]?.creatorType || 'N/A'})
  3. ${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[2]?.agentName || 'N/A'}: ${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[2]?.totalResponses || 0} responses, ${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[2]?.totalUsers || 0} users (${dashboardData.m365CopilotDeepDive.agents.topAgentsByUsage[2]?.creatorType || 'N/A'})
- Creator Type Distribution:
${Object.entries(dashboardData.m365CopilotDeepDive.agents.creatorTypeBreakdown).map(([type, count]) => `  - ${type}: ${count} combinations (${Math.round((count / dashboardData.m365CopilotDeepDive.agents.totalAgentUserCombinations) * 100)}%)`).join('\n')}
- Department Leaders (by total responses):
${dashboardData.m365CopilotDeepDive.agents.topAgentsByDepartment.slice(0, 3).map((agent, idx) => {
  const topDept = agent.byDepartment[0];
  return `  ${idx + 1}. ${agent.agentName}: ${topDept?.department || 'N/A'} leads with ${topDept?.responses || 0} responses (${topDept?.users || 0} users)`;
}).join('\n')}` : '- No agents data available'}

PRODUCTIVITY MULTIPLIERS:
- Coding Productivity Multiplier (Claude Code vs GitHub Copilot): ${dashboardData.codingProductivityMultiplier || 'N/A'}x
- General Productivity Multiplier (Claude Enterprise vs M365 Copilot): ${dashboardData.generalProductivityMultiplier || 'N/A'}x

VIRTUAL FTE IMPACT (Equivalent Headcount Added Through AI):
${dashboardData.agenticFTEs ? `- Current Month Agentic FTEs: ${dashboardData.agenticFTEs.current?.totalAgenticFTEs || 0} FTEs (equivalent full-time employees added)
- Current Month Productive Hours: ${(dashboardData.agenticFTEs.current?.totalProductiveHours || 0).toLocaleString()} hours
- Month Status: ${dashboardData.agenticFTEs.current?.isMTD ? `MTD - ${dashboardData.agenticFTEs.current?.daysOfData || 0} days of data` : 'Complete month'}
${dashboardData.agenticFTEs.projection ? `- Projected End-of-Month: ${dashboardData.agenticFTEs.projection.totalAgenticFTEs} FTEs, ${dashboardData.agenticFTEs.projection.totalProductiveHours.toLocaleString()} hours
- Projection Methodology: ${dashboardData.agenticFTEs.projection.methodology}` : ''}
- Tool Breakdown (Current):
  * Claude Enterprise: ${dashboardData.agenticFTEs.current?.breakdown?.claudeEnterprise || 0} FTEs (28% time savings × active users)
  * Claude Code: ${dashboardData.agenticFTEs.current?.breakdown?.claudeCode || 0} FTEs (0.08 hrs/line × lines generated)
  * M365 Copilot: ${dashboardData.agenticFTEs.current?.breakdown?.m365Copilot || 0} FTEs (14% time savings × active users)
  * GitHub Copilot: ${dashboardData.agenticFTEs.current?.breakdown?.githubCopilot || 0} FTEs (0.08 hrs/line × lines generated)
${dashboardData.agenticFTEs.monthOverMonth ? `- Month-over-Month Change: ${dashboardData.agenticFTEs.monthOverMonth.ftesChange > 0 ? '+' : ''}${dashboardData.agenticFTEs.monthOverMonth.ftesChange} FTEs (${dashboardData.agenticFTEs.monthOverMonth.percentChange > 0 ? '+' : ''}${dashboardData.agenticFTEs.monthOverMonth.percentChange}%)` : ''}
- Industry Benchmarks Used:
  * Claude Enterprise: 28% time savings (Anthropic research + Australian Government studies)
  * M365 Copilot: 14% time savings (Australian Government Digital.gov.au trial)
  * Coding tools: 0.08 hrs/line (based on 12.5 lines/hr manual baseline from Code Complete)
- Business Translation: ${dashboardData.agenticFTEs.current?.totalAgenticFTEs || 0} Agentic FTEs = capacity of ${dashboardData.agenticFTEs.current?.totalAgenticFTEs || 0} additional employees without hiring costs` : '- Agentic FTE data not available'}

COSTS & EXPANSION (CRITICAL - USE THESE EXACT NUMBERS):

CLAUDE ENTERPRISE COSTS (for Executive Summary focus):
- Current Claude Enterprise Monthly: $${(dashboardData.expansion?.currentCosts?.claudeEnterprise || 0).toLocaleString()}
- Full Rollout Claude Enterprise Monthly: $22,560 (hardcoded from Expansion ROI tab - will be migrated to data-driven in Phase 2.1)
- Claude Enterprise Monthly Increase: $${(22560 - (dashboardData.expansion?.currentCosts?.claudeEnterprise || 0)).toLocaleString()}
- Annual Current Claude Enterprise: $${((dashboardData.expansion?.currentCosts?.claudeEnterprise || 0) * 12).toLocaleString()}
- Annual Full Rollout Claude Enterprise: $${(22560 * 12).toLocaleString()}

TOTAL AI TOOLS BUDGET (all tools combined):
- Current Total Monthly Cost: $${(dashboardData.expansion?.currentCosts?.total || 0).toLocaleString()} (includes Claude + M365 + GitHub Copilot)
- Full Rollout Total Cost: $${(dashboardData.expansion?.fullRolloutCosts?.total || 0).toLocaleString()} (includes Claude + M365 Copilot)
- Monthly Total Increase: $${((dashboardData.expansion?.fullRolloutCosts?.total || 0) - (dashboardData.expansion?.currentCosts?.total || 0)).toLocaleString()}

OTHER TOOLS (for context):
- M365 Copilot Monthly: $${(dashboardData.expansion?.currentCosts?.m365Copilot || 0).toLocaleString()} (already org-wide, no change in rollout)
- GitHub Copilot Monthly: $${(dashboardData.expansion?.currentCosts?.githubCopilot || 0).toLocaleString()} (contract expires March 2026)

PAYBACK & ROI:
- Estimated Payback Period: ${dashboardData.expansion?.paybackPeriod || 'N/A'} months

TIME SAVINGS BY TOOL (Industry Benchmarks - CRITICAL: DO NOT MIX THESE):
- Claude Enterprise: ${dashboardData.productivity?.timeSavingsByTool?.claudeEnterprise || 0} hours/month (${dashboardData.claudeEnterprise?.activeUsers || 0} users × 10 hrs/user)
- M365 Copilot: ${dashboardData.productivity?.timeSavingsByTool?.m365Copilot || 0} hours/month (${dashboardData.m365Copilot?.activeUsers || 0} users × 10 hrs/user)
- GitHub Copilot: ${dashboardData.productivity?.timeSavingsByTool?.githubCopilot || 0} hours/month (${dashboardData.githubCopilot?.activeUsers || 0} users × 10 hrs/user)
- Claude Code: ${dashboardData.productivity?.timeSavingsByTool?.claudeCode || 0} hours/month (${dashboardData.claudeCode?.activeUsers || 0} users × 20 hrs/user)
- **TOTAL ALL TOOLS COMBINED: ${(dashboardData.productivity?.totalTimeSaved || 0).toLocaleString()} hours/month**

ROI CALCULATION - CLAUDE ENTERPRISE ONLY (USE THESE EXACT FIGURES):
⚠️ CRITICAL: Claude Enterprise time savings = ${dashboardData.productivity?.timeSavingsByTool?.claudeEnterprise || 0} hrs/month (NOT ${(dashboardData.productivity?.totalTimeSaved || 0).toLocaleString()})
- Claude Enterprise monthly cost: $${(dashboardData.expansion?.currentCosts?.claudeEnterprise || 0).toLocaleString()}
- Claude Enterprise time saved: ${dashboardData.productivity?.timeSavingsByTool?.claudeEnterprise || 0} hours/month
- Claude Enterprise value (at $100/hr): $${((dashboardData.productivity?.timeSavingsByTool?.claudeEnterprise || 0) * 100).toLocaleString()}
- Claude Enterprise ROI: ${((dashboardData.productivity?.timeSavingsByTool?.claudeEnterprise || 0) * 100 / (dashboardData.expansion?.currentCosts?.claudeEnterprise || 1)).toFixed(1)}x

ROI CALCULATION - ALL TOOLS COMBINED (for org-wide context):
- Total monthly cost (all tools): $${(dashboardData.expansion?.currentCosts?.total || 0).toLocaleString()}
- Total time saved (all tools): ${(dashboardData.productivity?.totalTimeSaved || 0).toLocaleString()} hours/month
- Total value (at $100/hr): $${((dashboardData.productivity?.totalTimeSaved || 0) * 100).toLocaleString()}
- Combined ROI: ${((dashboardData.productivity?.totalTimeSaved || 0) * 100 / (dashboardData.expansion?.currentCosts?.total || 1)).toFixed(1)}x

ADOPTION RATES & INDUSTRY BENCHMARKS:
- Claude Enterprise Adoption: ${dashboardData.overview?.adoptionRate || 'N/A'}% of organization (87 users out of 251 employees = 35%)
- M365 Copilot Adoption: ${Math.round(((dashboardData.m365Copilot?.activeUsers || 0) / 251) * 100)}% of organization (240 users out of 251 employees = 96%)
- Industry Benchmark for AI Tool Adoption: Typically 20-30% in first year, 40-60% at maturity
- TechCo Inc M365 Performance: Well above industry average (96% vs 30% typical)
- TechCo Inc Claude Performance: At industry average (35% vs 30% typical)

GENERATED INSIGHTS FROM DASHBOARD:

1. Lines Per User Trend:
${insights.linesPerUserTrend || 'Not available'}

2. Productivity Comparison:
${insights.productivityComparison || 'Not available'}

3. Model Preference:
${insights.modelPreference || 'Not available'}

4. Adoption Trend:
${insights.adoptionTrend || 'Not available'}

5. Engagement Trend:
${insights.engagementTrend || 'Not available'}

6. M365 App Usage Trend:
${insights.m365AppTrend || 'Not available'}

7. Coding Tools Business Question:
${insights.codingToolsBusinessQuestion || 'Not available'}

8. Claude Enterprise Features:
${insights.claudeEnterpriseFeatures || 'Not available'}

9. Strategic Positioning:
${insights.strategicPositioning || 'Not available'}

10. Department Insights:
${insights.departmentInsights || 'Not available'}

11. M365 Power Users:
${insights.m365PowerUsers || 'Not available'}

12. M365 App Adoption:
${insights.m365AppAdoption || 'Not available'}

13. M365 Department Performance:
${insights.m365DepartmentPerformance || 'Not available'}

14. M365 Opportunities:
${insights.m365Opportunities || 'Not available'}

15. M365 AI Agents Adoption (December):
${insights.m365AgentsAdoption || 'Not available'}

16. Claude Enterprise Department Performance:
${insights.claudeEnterpriseDepartmentPerformance || 'Not available'}

17. Claude Code Department Performance:
${insights.claudeCodeDepartmentPerformance || 'Not available'}

18. Cross-Platform Department Comparison:
${insights.crossPlatformDepartmentComparison || 'Not available'}

19. Department Adoption Heatmap (All Tools Combined):
${insights.departmentAdoptionHeatmap || 'Not available'}

20. Agentic FTE Impact (Equivalent Headcount):
${insights.virtualFteImpact || 'Not available'}

21. Claude Enterprise Projects Overview:
${insights.projectsOverview || 'Not available'}

22. Claude Enterprise Integrations/Connectors Overview:
${insights.integrationsOverview || 'Not available'}

23. AI Ecosystem Comparison (M365 Agents vs CE Projects & Integrations):
${insights.ecosystemComparison || 'Not available'}

DEPARTMENT ADOPTION HEATMAP (Top 10 by Score):
${dashboardData.departmentAdoptionHeatmap?.slice(0, 10).map(d =>
  `- ${d.department}: Score ${d.adoptionScore}/100 (${d.tier}) - ${d.users} seats, ${d.employees} employees (${d.seatsPerEmployee.toFixed(2)} seats/emp), ${d.activity.toLocaleString()} total activity (${d.activityPerEmployee.toFixed(0)}/emp, ${d.activityPerSeat.toFixed(0)}/seat)`
).join('\n') || 'Not available'}

CLAUDE ENTERPRISE DEPARTMENT BREAKDOWN (Top 5 by Agentic FTE):
${dashboardData.claudeEnterprise?.departmentBreakdown?.slice(0, 5).map(d =>
  `- ${d.department}: ${d.users} users, ${d.messages.toLocaleString()} messages (${d.avgMessagesPerUser}/user), ${d.artifacts} artifacts (${d.avgArtifactsPerUser}/user)${d.agenticFTE ? `, Agentic FTE: ${d.agenticFTE.toFixed(2)}` : ''}, Top: ${d.topUser?.name || 'N/A'} (${d.topUser?.messages || 0} messages${d.topUser?.agenticFTE ? `, ${d.topUser.agenticFTE.toFixed(2)} FTEs` : ''})`
).join('\n') || 'Not available'}

CLAUDE CODE DEPARTMENT BREAKDOWN (All with Agentic FTE):
${dashboardData.code?.departmentBreakdown?.map(d =>
  `- ${d.department}: ${d.users} users, ${d.totalLines.toLocaleString()} lines (${d.linesPerUser.toLocaleString()}/user)${d.agenticFTE ? `, Agentic FTE: ${d.agenticFTE.toFixed(2)}` : ''}, Top: ${d.topUser?.username || 'N/A'} (${d.topUser?.lines?.toLocaleString() || '0'} lines${d.topUser?.agenticFTE ? `, ${d.topUser.agenticFTE.toFixed(2)} FTEs` : ''})`
).join('\n') || 'Not available'}

M365 COPILOT DEPARTMENT PERFORMANCE (Top 5 by Agentic FTE):
${dashboardData.m365CopilotDeepDive?.departmentPerformance?.slice(0, 5).map(d =>
  `- ${d.department}: ${d.users} users, ${d.avgPrompts} avg prompts, ${d.avgPromptsPerDay} prompts/day (${d.intensity})${d.agenticFTE ? `, Agentic FTE: ${d.agenticFTE.toFixed(2)}` : ''}, Top: ${d.topUser?.name || 'N/A'} (${d.topUser?.totalPrompts || 0} prompts${d.topUser?.agenticFTE ? `, ${d.topUser.agenticFTE.toFixed(2)} FTEs` : ''})`
).join('\n') || 'Not available'}

DEPARTMENT BREAKDOWN (Legacy - Top 10):
${dashboardData.departments?.departmentBreakdown?.slice(0, 10).map(d =>
  `- ${d.department}: ${d.claudeEnterprise.activeUsers} CE users (${d.claudeEnterprise.conversationsPerUser} convos/user), ${d.claudeCode.activeUsers} CC users (${d.claudeCode.linesPerUser} lines/user)`
).join('\n') || 'Not available'}

KEY PERSONNEL CONTEXT (use titles when mentioning these individuals):
${dashboardData.notablePersonnel?.map(p => `- ${p.name}, ${p.title} (${p.department}) - ${p.context}`).join('\n') || 'No personnel context available'}
`;

    // Executive Summary (BLUF for executives/board)
    insights.executiveSummary = await generateInsight(
      'executiveSummary',
      insightsSummary,
      'Synthesize this comprehensive dashboard insights summary into a BLUF executive summary. CRITICAL: Include detailed analysis of Agentic FTE impact at ALL levels: (1) Claude Code Agentic FTE by department and top users - highlight engineering productivity gains, (2) Claude Enterprise Web/Desktop Agentic FTE by department and users, (3) COMBINED Claude Enterprise ecosystem (CE + CC) Agentic FTE showing total productivity value vs M365 Copilot, (4) M365 Copilot Agentic FTE. When discussing "leading departments" or "top departments", you MUST reference the COMBINED Claude Enterprise ecosystem (CE web + CC code) Agentic FTE values, NOT just Claude Enterprise web/desktop alone. Emphasize the combined Claude Enterprise ecosystem advantage - CE web + CC coding tools delivering superior productivity vs M365 alone. Explain what Agentic FTE numbers mean for organizational capacity, departmental productivity, individual contributor impact, and business value. Connect to ROI, cost efficiency, and strategic competitive advantage. Use ONLY the metrics provided. DO NOT generate new numbers.',
      2500  // Increased token limit for comprehensive executive summary
    );

    // All Hands Message (employee-facing, 3 slides)
    // Add additional context for All Hands
    const allHandsSummary = insightsSummary + `

ADDITIONAL CONTEXT FOR ALL HANDS:
- Total Employees: 251
- Slack Feedback Channels: #claude-enterprise, #claude-code-dev, #ai-collab, #techco-thrv
- Upcoming Decision: GitHub Copilot contract renewal (March 2026)
- Expansion Opportunity: ${(dashboardData.expansion?.fullRolloutCosts?.total || 0) > (dashboardData.expansion?.currentCosts?.total || 0) ? 'Yes - significant rollout potential' : 'Limited'}
`;

    insights.allHandsMessage = await generateInsight(
      'allHandsMessage',
      allHandsSummary,
      'Synthesize this comprehensive dashboard insights summary into an uplifting, transparent employee-facing presentation (3 slides). CRITICAL: Include Agentic FTE data in the slides - show how AI tools are adding equivalent full-time capacity, highlight top performing departments, and celebrate the collective productivity gains. Connect Agentic FTE to tangible business impact and team achievements. Use ONLY the metrics and insights provided above. DO NOT generate new numbers or re-analyze data. Include: celebration of value/impact with Agentic FTE highlights, tips for getting more value, feedback channels, and what\'s coming next.',
      2500  // Increased token limit for comprehensive 3-slide presentation
    );

    console.log(`\n✅ Generated ${Object.keys(insights).filter(k => insights[k]).length} insights successfully\n`);

  } catch (error) {
    console.error('❌ Error in generateAllInsights:', error.message);
  }

  return insights;
}

module.exports = {
  generateInsight,
  generateAllInsights,
  AI_CONFIG
};
