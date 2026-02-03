"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Target, Users, TrendingUp, AlertTriangle, AlertCircle, Lightbulb, BarChart3, CheckCircle, Clock, Download } from 'lucide-react';

// Slide data structure based on the markdown presentation - now a function to support dynamic metrics
const getSlidesData = (metrics, portfolioData) => {
  // Extract dynamic values with fallbacks
  const ceAdoption = metrics?.claudeEnterprise.adoption || "84%";
  const ceAdoptionSubtext = metrics?.claudeEnterprise.adoptionSubtext || "94 of 112 licensed users";
  const ceEngagement = metrics?.claudeEnterprise.engagementMultiplier || "8.4x";
  const ccProductivity = metrics?.claudeCode.productivityMultiplier || "17.6x";
  const ccTotalLines = metrics?.claudeCode.totalLines || "655,677";
  const ccAdoptionText = metrics?.claudeCode.adoptionText || "42% Claude Code adoption (19 of 45 engineers)";
  const ceAdoptionNumeric = metrics?.claudeEnterprise.adoptionNumeric || 84;
  const ccProductivityNumeric = metrics?.claudeCode.productivityMultiplierNumeric || 17.6;

  return [
  {
    id: 1,
    title: "2026 Annual Plan: Data-Driven, Agile AI Strategy",
    subtitle: "TechCo Inc Agentic AI Team",
    type: "title",
    content: {
      approach: [
        `Celebrate Wins: Claude Enterprise ${ceAdoption} adoption (${ceEngagement} productivity advantage), Claude Code ${ccProductivity} productivity advantage`,
        "Be Strategic: Dependencies first, realistic capacity planning",
        "Stay Agile: Quarterly re-prioritization based on KPIs and results",
        "Conserve Resources: Maximize existing investments before expanding"
      ],
      plan: [
        "Agile Portfolio Approach: Q1 committed to 5-6 foundation projects. Q2-Q4 projects depend on Q1-Q2 results",
        "$22.4M Annual Value potential from portfolio (11 identified opportunities)",
        "Quarterly Reviews with CEO to re-prioritize and commit to next quarter based on results",
        "Adaptive Resource Allocation: Scale champion model in Q2+ based on Q1 validation"
      ],
      q1Commitment: [
        "Add 33 new Premium licenses for Engineering/Product",
        "Expand TechCo Inc Claude Marketplace to Windows/.NET engineers (new tech stack/agentic processes)",
        "Launch Business Operational Data Foundation MVP (operational insights for data-driven decisions) - 10-week sprint",
        "Continue Law2Engine prototype (40% → 60%)",
        "Deliver Forever Code Components & Products (OP-012/013) - 80% of team capacity"
      ]
    }
  },
  {
    id: 2,
    title: "Current State - Wins & Successes",
    subtitle: "The Agentic AI Team Has Proven AI Works at TechCo Inc",
    type: "metrics",
    content: {
      claudeEnterprise: {
        title: "Claude Enterprise Deployment",
        metrics: [
          { label: "Adoption", value: ceAdoption, subtext: ceAdoptionSubtext },
          { label: "Perceived Value", value: "85/100", subtext: "vs M365 Copilot 38/100" },
          { label: "Engagement", value: ceEngagement, subtext: "more than M365 Copilot (370 vs 44 prompts/user)" },
          { label: "Monthly Value", value: "$564K", subtext: "from 5,642 hours saved" }
        ]
      },
      claudeCode: {
        title: "Claude Code Productivity",
        metrics: [
          { label: "Productivity", value: ccProductivity, subtext: "more than GitHub Copilot (34,509 vs 2,380 lines/user)" },
          { label: "Perceived Value", value: "94/100", subtext: "highest of all tools" },
          { label: "Total Lines", value: ccTotalLines, subtext: "generated (gtaborga: 153K, dwagner: 32K, sjohnson: 23K)" }
        ]
      },
      infrastructure: {
        title: "Infrastructure Built",
        items: [
          "TechCo Inc Claude Marketplace v1.3.0: 14 plugins (growing daily!) enabling agentic coding for Agentic AI and Engineering teams",
          "Law2Engine: 40% complete prototype, $1.7-6.4M 3-year value",
          "AI Insights Dashboard App: This intelligence platform we're using today"
        ]
      },
      leaders: {
        title: "Department Leaders",
        items: [
          { dept: "Agentic AI", score: "97/100", status: "green" },
          { dept: "Product", score: "92/100", status: "green" },
          { dept: "Revenue Operations", score: "84/100", status: "green" },
          { dept: "Operations", score: "82/100", status: "green" },
          { dept: "Engineering", score: "75/100", status: "yellow" }
        ]
      }
    }
  },
  {
    id: 3,
    title: "Current State - Challenges & Opportunities",
    subtitle: "We Have More Opportunities Than Capacity - Need Strategic Prioritization",
    type: "challenges",
    content: {
      gaps: [
        {
          icon: AlertTriangle,
          title: "Engineering Coverage Gap - Productivity Multiplier Loss",
          details: `Only ${ccAdoptionText}. Losing ${ccProductivity} productivity advantage for ${metrics?.claudeCode.licensedUsers - metrics?.claudeCode.activeUsers || 26} engineers without Claude Code. Every engineer without Claude Code loses 1,660% productivity gain vs GitHub Copilot. Windows/.NET engineers lack tooling.`
        },
        {
          icon: Users,
          title: "License Expansion Needed",
          details: "Procure 33 new Premium (Claude Code) licenses for full Engineering/Product coverage (72 total needed, 45 current). All engineers must have Claude Code to maximize productivity multiplier."
        },
        {
          icon: TrendingUp,
          title: "Revenue Teams Need Enablement",
          details: "Adoption scores below 60/100 threshold: Customer Success 57/100, Sales-Enterprise 50/100, Professional Services 43/100. Low activity and engagement indicate training/enablement gaps."
        }
      ],
      portfolio: {
        projects: "11 AI project opportunities",
        value: "$22.4M potential annual value",
        challenge: "Limited Agentic AI team capacity (6 people, 80% on Forever Code)"
      },
      timing: [
        `March 2026: GitHub Copilot contract renewal decision - Given Claude Code ${ccProductivity} advantage & Claude Enterprise ${ceEngagement} advantage, strong case for consolidation`,
        "Q1-Q2 2026: Forever Code deliverables (Leave Planning + Case Management) - Requested by Head of Product, product foundation for competitive differentiation"
      ]
    }
  },
  {
    id: 4,
    title: "Strategic Rationale",
    subtitle: "Why This Plan, Why Now",
    type: "strategy",
    content: {
      shortTerm: {
        title: "Short-Term (Q1-Q2): Enable Existing, Prove ROI, Build Foundations, Deliver Forever Code Products",
        items: [
          "Add 33 new Premium licenses → enable all Eng/Product for Claude Code",
          "Expand TechCo Inc Claude Marketplace for Forever Code tech stack + enable Windows/.NET with plugins for agentic SDLC (legacy codebase)",
          "Launch Business Operational Data Foundation → operational insights infrastructure for 7+ AI projects",
          "Law2Engine prototype continuation and maturation",
          "Deliver Forever Code Products: Leave Planning Tool + Downmarket Case Management solution (80% team capacity Q1-Q2)",
          "Champion model test → GTM champions, Engineering champions, Product champions"
        ]
      },
      longTerm: {
        title: "Long-Term (Q3-Q4): Potential Projects - Dependent on Q1-Q2 Success",
        items: [
          "Conditional on Q1-Q2 results: Champion model validation, foundation project success, ROI realization",
          "If successful: Champion community grows from 3 → 10+ by Q3",
          "Potential revenue projects: Lead Generation, Sales Deal Intelligence, Proposals",
          "Potential product innovations: Law2Engine GA, Case Management enhancements",
          "Potential retention tools: Ops Knowledge, PS Time-to-Value",
          "Note: Q3-Q4 projects committed only after Q2 review demonstrates Q1-Q2 success"
        ]
      },
      priorities: [
        "Dependencies First: Licenses, TechCo Inc Claude Marketplace, Business Operational Data Foundation",
        "Quick Wins: High ROI, realistic execution (Lead Generation, Proposals)",
        "Champion Validation: Prove scaling model works before expanding"
      ]
    }
  },
  {
    id: 5,
    title: "2026 Annual Plan - Quarterly View",
    subtitle: "Progressive Scaling from 72 to 612 Engineering-Days (Non-R&D Forever Code)",
    type: "quarterly",
    content: {
      quarters: [
        {
          quarter: "Q1 2026",
          subtitle: "Foundation & Forever Code (COMMITTED - 72 eng-days for agentification)",
          status: "committed",
          projects: [
            "OP-000 Phase 1: Add 33 Premium licenses (Engineering/Product) - 15 days",
            "OP-011: TechCo Inc Claude Marketplace expansion (Windows/.NET + Forever Code agentic SDLC) - 25 days",
            "OP-014: Business Operational Data Foundation MVP kickoff (operational insights infrastructure) - 10-week sprint - 12 days",
            "OP-008: Law2Engine 40% → 60% - 20 days",
            "OP-012/013: Forever Code (Leave Planning + Case Management) - 80% capacity"
          ],
          capacity: "100% allocated",
          reviewGate: "March 31, 2026"
        },
        {
          quarter: "Q2 2026",
          subtitle: "Revenue Generation & Business Operational Data Foundation (POTENTIAL - TBD based on Q1 results - 204 eng-days for agentification)",
          status: "potential",
          projects: [
            "OP-014: Complete Business Operational Data Foundation production (operational insights + AI analytics) - 48 days",
            "OR OP-001 Phase 1: Sales Deal Agentic Intelligence quick wins - 60 days",
            "Flexibility Note: OP-014 prioritized for infrastructure. Can pivot to OP-001 if Gong MCP + Salesforce MCP (Feb 2026 launch) both mature early and GTM priorities shift. Conditions: Reduce OP-014 scope to core MVP OR add resources OR defer other Q2 projects.",
            "OP-005 Phase 1: Lead Generation Agentic Intelligence quick wins (GTM champions) - 60 days",
            "OP-011 Phase 2: Plugin library expansion (Engineering champion-led) - 40 days",
            "OP-000 Phase 2: Sales/Marketing license expansion - 20 days",
            "OP-002: Ops Knowledge Agent pilot - 22 days"
          ],
          capacity: "93% allocated, 14-day buffer",
          reviewGate: "June 30, 2026"
        },
        {
          quarter: "Q3 2026",
          subtitle: "Scale & Production Launches (POTENTIAL - TBD based on Q1-Q2 results - 408 eng-days for agentification)",
          status: "potential",
          projects: [
            "OP-008: Law2Engine GA launch - 90 days",
            "OP-005 Phase 2: Lead Generation full platform (15 BDRs, all 6 AI Agents) - 120 days",
            "OP-006: PS Time-to-Value Accelerator (Product champion-led) - 85 days",
            "OP-004: AI Proposal Generator start - 50 days",
            "Forever Code maintenance - 40 days"
          ],
          capacity: "94% allocated, 23-day buffer",
          reviewGate: "September 30, 2026"
        },
        {
          quarter: "Q4 2026",
          subtitle: "Strategic Bets & 2027 Planning (POTENTIAL - TBD based on Q1-Q3 results - 612 eng-days for agentification)",
          status: "potential",
          projects: [
            "OP-001: Sales Deal Agentic Intelligence (if Gong MCP + Salesforce MCP production-ready) - 180 days",
            "OP-002: Ops Knowledge full launch - 90 days",
            "OP-004: Proposals complete - 120 days",
            "OP-013: Case Management enhancements - 60 days",
            "2027 Annual Planning - 60 days"
          ],
          capacity: "92% allocated, 52-day buffer",
          reviewGate: "December 31, 2026"
        }
      ]
    }
  },
  {
    id: 6,
    title: "Resource Requirements & Capacity Model",
    subtitle: "8.5x Capacity Growth Through Champion Scaling (Non-R&D Forever Code Work)",
    type: "resources",
    content: {
      note: "Engineering-days shown are for departmental agentification work (non-product R&D). Forever Code product development (80% of team in Q1-Q2) is separate and dedicated.",
      currentTeam: {
        title: "Current Team (Q1-Q2)",
        people: "6 People - Agentic AI team",
        commitment: "80% on Forever Code R&D (OP-012/013), 20% on departmental agentification",
        q1Capacity: "72 eng-days (for agentification projects)",
        q2Capacity: "84 eng-days (+ Data Engineer hire mid-Q1)"
      },
      championModel: {
        title: "Champion Model (Q2+ Scaling)",
        q1Test: "GTM champions, Engineering champions, Product champions",
        q2Scale: "3-4 champions contributing ~120 eng-days",
        breakdown: [
          "Plugin/Marketplace: 80% champion-led (+60 days, Engineering)",
          "BDR/Domain: 60% champion-led (+45 days, GTM)",
          "Product features: 40% champion-led (+15 days, Product)"
        ],
        q3Mature: "5-6 champions, ~240 eng-days",
        q4SelfSustaining: "8-10 champions, self-sustaining community (360 eng-days)"
      },
      capacityGrowth: [
        { quarter: "Q1", days: 72, description: "6 people × 20% = 72 eng-days (agentification)" },
        { quarter: "Q2", days: 204, description: "7 people × 20% + 120 champion = 204 eng-days" },
        { quarter: "Q3", days: 408, description: "7 people × 40% + 240 champion = 408 eng-days" },
        { quarter: "Q4", days: 612, description: "7 people × 60% + 360 champion = 612 eng-days" }
      ],
      capacityAssumptions: "Champion time allocation: Q2 (30% avg), Q3 (40% avg), Q4 (45% avg). Project type varies: Plugins 80% champion-led, BDR/Domain 60%, Product features 40%.",
      scenarios: {
        scenarioA: {
          title: "Scenario A: Transfer 2 Engineers in Q2",
          cost: "+$300K cost",
          unlock: "+720 eng-days over 9 months",
          enable: "Sales Deal Agentic Intelligence (OP-001) moves to Q3, Finance Forecasting & Scenario Planning (OP-007) + HR Recruitment AI (OP-010) added to Q4",
          value: "+$7M → 2,233% incremental ROI",
          valueCalculation: "Calculation: Sales Deal Intelligence earlier by 1 quarter = +$1.75M, plus Finance Forecasting (OP-007) + HR Recruitment (OP-010) value. ROI = $7M / $300K = 2,333%",
          decisionPoint: "Q2 review (June 30) if champion model underperforms"
        }
      }
    }
  },
  {
    id: 7,
    title: "Quarterly Review Process & KPIs",
    subtitle: "How We Stay Agile: Data-Driven Quarterly Reviews",
    type: "kpis",
    content: {
      cadence: [
        { date: "March 31", description: "Review Q1 results, finalize Q2 commitments" },
        { date: "June 30", description: "Review Q2 results, finalize Q3, adjust Q4" },
        { date: "September 30", description: "Review Q3 results, finalize Q4" },
        { date: "December 31", description: "Annual retrospective, plan 2027" }
      ],
      projectKPIs: [
        {
          name: "Delivery Health",
          description: "Green: On schedule ± 2 weeks | Yellow: 2-4 weeks behind, mitigation in place | Red: >4 weeks behind, needs scope/resource adjustment"
        },
        {
          name: "Adoption Rate",
          description: "Target: >60% of intended users within 30 days (Example: OP-000 Phase 1 should drive Claude Code 42% → 70%+)"
        },
        {
          name: "ROI Realization",
          description: "Actual value vs forecast (Example: OP-005 forecast $3.1M, track actual pipeline generated)"
        },
        {
          name: "User Sentiment",
          description: "Target: >70 perceived value score (from dashboard), Slack sentiment analysis, champion feedback"
        }
      ],
      portfolioKPIs: [
        "Note: Starting point KPIs based on current adoption metrics. Real KPIs TBD in Q1 as we transition from core adoption to value realization metrics (e.g., actual business outcomes, revenue impact, time savings realized vs forecasted).",
        `Claude Enterprise: ${ceAdoptionNumeric}% baseline, maintain or improve`,
        "Claude Code: 42% baseline → 70% Q1 target → 80% Q2 target",
        "Productivity: 34,509 lines/user baseline, maintain or improve",
        "Portfolio ROI: >300% blended target"
      ]
    }
  },
  {
    id: 8,
    title: "Risks & Mitigation",
    subtitle: "Key Risks & Mitigation Strategies",
    type: "risks",
    content: {
      risks: [
        {
          title: "Risk 1: Champion Model Doesn't Scale",
          impact: "Q2-Q4 capacity drops 60%, projects defer",
          likelihood: "Medium (unproven model)",
          mitigation: [
            "Q1 validation with 3 champions (GTM, Engineering, Product)",
            "TechCo Inc Claude Marketplace must be self-service ready (reduce hand-holding)",
            "Rigorous champion selection criteria",
            "Scenario A ready: Hire 2 engineers if needed (Q2 decision point)"
          ],
          earlyWarning: "Q1 review (March 31) - if champions contribute <50% expected"
        },
        {
          title: "Risk 2: Forever Code Delays Impact Capacity",
          impact: "Q3-Q4 capacity constrained, projects defer",
          likelihood: "Medium (complex products, June deadline)",
          mitigation: [
            "80% capacity firewall (protected from other work)",
            "Q2 review can adjust Q3-Q4 if needed",
            "Buffer days in each quarter (14-52 days) absorb minor slips",
            "Forever Code takes priority - other projects defer if needed"
          ],
          earlyWarning: "Q2 review (June 30) - Forever Code delivery status"
        },
        {
          title: "Risk 3: External Dependencies (Gong MCP, Salesforce MCP)",
          impact: "OP-001 (Sales Deal Intelligence) delays or cancels",
          likelihood: "Medium (Gong MCP launched Oct 2025, Salesforce MCP projected Feb 2026 - both need maturity)",
          mitigation: [
            "Scheduled for Q4 (gives 12+ months for Gong to mature, 10+ months for Salesforce MCP)",
            "Q3 review has go/no-go decision based on both MCPs' readiness",
            "Alternative: Defer to Q1 2027 (only 3-month slip)",
            "Value at risk: $5-7M, but other projects still deliver $17M+"
          ],
          earlyWarning: "Q3 review (Sept 30) - Gong MCP + Salesforce MCP stability assessment"
        }
      ]
    }
  },
  {
    id: 9,
    title: "AI Project Portfolio - Priority & Scoring",
    subtitle: `${portfolioData?.projects?.length || 0} Projects Ranked by Hybrid Score`,
    type: "portfolio",
    content: {
      methodology: portfolioData?.methodology || {
        formula: "Q1-Q2: (0.7 × Multi_Factor) + (0.3 × ROI)",
        components: ["Financial Impact (30%)", "Strategic Alignment (25%)", "Execution Feasibility (25%)", "Time to Value (20%)", "ROI Score (30% weight)"]
      },
      projects: portfolioData?.projects || []
    }
  }
  ];  // End of slides array
};  // End of getSlidesData function

const Slide = ({ slide, slideNumber, totalSlides, progressData }) => {
  const renderTitleSlide = () => (
    <div className="h-full flex flex-col justify-center items-center text-center px-16">
      <div className="mb-8">
        <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6">
          2026 Strategic Planning
        </div>
      </div>
      <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
        {slide.title}
      </h1>
      <p className="text-2xl text-gray-600 mb-12">{slide.subtitle}</p>

      <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-left">
          <div className="flex items-center mb-4">
            <Target className="h-8 w-8 text-blue-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">Our Approach</h3>
          </div>
          <ul className="space-y-3">
            {slide.content.approach.map((item, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 text-left">
          <div className="flex items-center mb-4">
            <BarChart3 className="h-8 w-8 text-green-600 mr-3" />
            <h3 className="text-xl font-bold text-gray-900">The Plan</h3>
          </div>
          <ul className="space-y-3">
            {slide.content.plan.map((item, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 max-w-4xl mx-auto text-white">
        <h3 className="text-2xl font-bold mb-4 flex items-center justify-center">
          <CheckCircle className="h-7 w-7 mr-3" />
          Q1 Commitment
        </h3>
        <ul className="space-y-2 text-sm">
          {slide.content.q1Commitment.map((item, idx) => (
            <li key={idx} className="flex items-start">
              <span className="mr-2">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs opacity-90">Q2-Q4 Subject to Quarterly Review</p>
      </div>
    </div>
  );

  const renderMetricsSlide = () => (
    <div className="h-full flex flex-col p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slide.title}</h2>
        <p className="text-xl text-gray-600">{slide.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Claude Enterprise */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{slide.content.claudeEnterprise.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {slide.content.claudeEnterprise.metrics.map((metric, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{metric.value}</div>
                <div className="text-xs text-gray-500">{metric.subtext}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Claude Code */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{slide.content.claudeCode.title}</h3>
          <div className="space-y-4">
            {slide.content.claudeCode.metrics.map((metric, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-sm text-gray-600 mb-1">{metric.label}</div>
                <div className="text-3xl font-bold text-purple-600 mb-1">{metric.value}</div>
                <div className="text-xs text-gray-500">{metric.subtext}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Infrastructure */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{slide.content.infrastructure.title}</h3>
          <ul className="space-y-3">
            {slide.content.infrastructure.items.map((item, idx) => (
              <li key={idx} className="flex items-start text-sm text-gray-700 bg-white rounded-lg p-3 shadow-sm">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Department Leaders */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{slide.content.leaders.title}</h3>
          <div className="space-y-3">
            {slide.content.leaders.items.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{item.dept}</span>
                <div className="flex items-center">
                  <span className="text-lg font-bold text-gray-900 mr-2">{item.score}</span>
                  <div className={`w-3 h-3 rounded-full ${item.status === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderChallengesSlide = () => (
    <div className="h-full flex flex-col p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slide.title}</h2>
        <p className="text-xl text-gray-600">{slide.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Critical Gaps */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Critical Coverage Gaps</h3>
          {slide.content.gaps.map((gap, idx) => {
            const Icon = gap.icon;
            return (
              <div key={idx} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-l-4 border-red-500">
                <div className="flex items-start">
                  <Icon className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">{gap.title}</h4>
                    <p className="text-sm text-gray-700">{gap.details}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Project Portfolio */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h4 className="font-bold text-gray-900 mb-3">AI Project Portfolio</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold">{slide.content.portfolio.projects}</span> with <span className="font-semibold">{slide.content.portfolio.value}</span></p>
              <p className="text-xs">{slide.content.portfolio.challenge}</p>
            </div>
          </div>
        </div>

        {/* Strategic Timing & Opportunity */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Strategic Timing</h3>
          {slide.content.timing.map((item, idx) => (
            <div key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 mt-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center">
              <Lightbulb className="h-6 w-6 text-purple-600 mr-2" />
              The Opportunity
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Activate unused licenses through training + Windows/.NET enablement</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Scale through champions (not headcount)</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Use data to prioritize highest-impact projects</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>Build foundations first, then scale revenue/retention projects</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategySlide = () => (
    <div className="h-full flex flex-col p-12">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slide.title}</h2>
        <p className="text-xl text-gray-600">{slide.subtitle}</p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Short-Term */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-l-4 border-blue-600">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{slide.content.shortTerm.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {slide.content.shortTerm.items.map((item, idx) => (
              <div key={idx} className="flex items-start text-sm text-gray-700">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0 text-xs font-bold">
                  {idx + 1}
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Long-Term */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-l-4 border-green-600">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{slide.content.longTerm.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {slide.content.longTerm.items.map((item, idx) => (
              <div key={idx} className="flex items-start text-sm text-gray-700">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Priorities */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-300">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-6 w-6 text-purple-600 mr-3" />
            Strategic Priorities (Dependencies → Quick Wins → Champion Validation)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {slide.content.priorities.map((priority, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600 mb-2">{idx + 1}</div>
                <p className="text-sm text-gray-700 font-medium">{priority}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuarterlySlide = () => (
    <div className="h-full flex flex-col p-12">
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slide.title}</h2>
        <p className="text-xl text-gray-600">{slide.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-auto">
        {slide.content.quarters.map((q, idx) => {
          const bgColor = q.status === 'committed'
            ? 'from-green-50 to-emerald-50 border-green-300'
            : 'from-blue-50 to-indigo-50 border-blue-200';
          const iconColor = q.status === 'committed' ? 'text-green-600' : 'text-blue-600';

          return (
            <div key={idx} className={`bg-gradient-to-br ${bgColor} rounded-xl p-5 border-2`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{q.quarter}</h3>
                {q.status === 'committed' && (
                  <div className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    COMMITTED
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-3 font-medium">{q.subtitle}</p>

              <ul className="space-y-1.5 mb-3 text-xs">
                {q.projects.map((project, pIdx) => (
                  <li key={pIdx} className="flex items-start">
                    <span className={`mr-2 ${iconColor} mt-0.5 flex-shrink-0`}>
                      {q.status === 'committed' ? '✓' : '→'}
                    </span>
                    <span className="text-gray-700">{project}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-gray-200 space-y-1">
                <div className="flex items-center text-xs">
                  <BarChart3 className={`h-4 w-4 mr-2 ${iconColor}`} />
                  <span className="text-gray-700 font-medium">{q.capacity}</span>
                </div>
                <div className="flex items-center text-xs">
                  <Calendar className={`h-4 w-4 mr-2 ${iconColor}`} />
                  <span className="text-gray-700">Review: {q.reviewGate}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderResourcesSlide = () => (
    <div className="h-full flex flex-col p-12">
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slide.title}</h2>
        <p className="text-xl text-gray-600">{slide.subtitle}</p>
      </div>

      {/* Important Note */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded-r-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> {slide.content.note}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Current Team */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{slide.content.currentTeam.title}</h3>
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="font-semibold text-gray-900">Team Size</div>
              <div className="text-gray-700">{slide.content.currentTeam.people}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="font-semibold text-gray-900">Commitment</div>
              <div className="text-gray-700">{slide.content.currentTeam.commitment}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm flex justify-between">
              <div>
                <div className="font-semibold text-gray-900">Q1 Capacity</div>
                <div className="text-2xl font-bold text-blue-600">{slide.content.currentTeam.q1Capacity}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Q2 Capacity</div>
                <div className="text-2xl font-bold text-blue-600">{slide.content.currentTeam.q2Capacity}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Champion Model */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{slide.content.championModel.title}</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="font-semibold text-gray-900 mb-1">Q1 Test</div>
              <div className="text-gray-700">{slide.content.championModel.q1Test}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="font-semibold text-gray-900 mb-1">Q2 Scale</div>
              <div className="text-gray-700 mb-2">{slide.content.championModel.q2Scale}</div>
              <ul className="space-y-1 text-xs">
                {slide.content.championModel.breakdown.map((item, idx) => (
                  <li key={idx} className="text-gray-600">• {item}</li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-xs text-gray-600">Q3 Mature</div>
                <div className="font-bold text-purple-600">{slide.content.championModel.q3Mature}</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-xs text-gray-600">Q4 Self-Sustaining</div>
                <div className="font-bold text-purple-600">{slide.content.championModel.q4SelfSustaining}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Growth Chart */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Capacity Growth Path (Engineering-Days)</h3>
          <div className="space-y-3">
            {slide.content.capacityGrowth.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-gray-900">{item.quarter}</span>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-green-600">{item.days}</span>
                    <span className="text-sm text-gray-600 ml-1">eng-days</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600">{item.description}</div>
                <div className="mt-2 bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(item.days / 612) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Assumptions */}
          <div className="mt-4 bg-white rounded-lg p-3 border border-green-300">
            <div className="text-xs font-semibold text-green-900 mb-1">Assumptions:</div>
            <div className="text-xs text-green-800">{slide.content.capacityAssumptions}</div>
          </div>
        </div>

        {/* Scenario A */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border-2 border-orange-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{slide.content.scenarios.scenarioA.title}</h3>
          <div className="space-y-2 text-sm">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-600">Investment</div>
              <div className="font-bold text-orange-600">{slide.content.scenarios.scenarioA.cost}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-600">Unlock</div>
              <div className="font-semibold text-gray-900">{slide.content.scenarios.scenarioA.unlock}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-600">Enable</div>
              <div className="text-gray-700">{slide.content.scenarios.scenarioA.enable}</div>
            </div>
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <div className="text-xs text-gray-600">Value & ROI</div>
              <div className="font-bold text-green-600 mb-2">{slide.content.scenarios.scenarioA.value}</div>
              <div className="text-xs text-gray-700 italic">{slide.content.scenarios.scenarioA.valueCalculation}</div>
            </div>
            <div className="bg-orange-100 rounded-lg p-3 border border-orange-300">
              <div className="text-xs text-orange-900 font-semibold">Decision Point</div>
              <div className="text-xs text-orange-800">{slide.content.scenarios.scenarioA.decisionPoint}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKPIsSlide = () => (
    <div className="h-full flex flex-col p-12">
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slide.title}</h2>
        <p className="text-xl text-gray-600">{slide.subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 flex-1">
        {/* Review Cadence */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-6 w-6 text-blue-600 mr-3" />
            Review Cadence
          </h3>
          <div className="space-y-3">
            {slide.content.cadence.map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm flex items-start">
                <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-gray-900 mb-1">{item.date}</div>
                  <div className="text-sm text-gray-700">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project-Level KPIs */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Target className="h-6 w-6 text-purple-600 mr-3" />
            Project-Level KPIs
          </h3>
          <div className="space-y-3">
            {slide.content.projectKPIs.map((kpi, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="font-bold text-gray-900 mb-2">{kpi.name}</div>
                <div className="text-xs text-gray-700">{kpi.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio-Level KPIs */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 col-span-2">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
            Portfolio-Level KPIs (From Dashboard)
          </h3>
          <div className="grid grid-cols-4 gap-4">
            {slide.content.portfolioKPIs.map((kpi, idx) => (
              <div key={idx} className="bg-white rounded-lg p-4 shadow-sm">
                <CheckCircle className="h-5 w-5 text-green-500 mb-2" />
                <p className="text-sm text-gray-700">{kpi}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRisksSlide = () => (
    <div className="h-full flex flex-col p-12">
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">{slide.title}</h2>
        <p className="text-xl text-gray-600">{slide.subtitle}</p>
      </div>

      <div className="space-y-4 flex-1 overflow-auto">
        {slide.content.risks.map((risk, idx) => (
          <div key={idx} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border-l-4 border-red-500">
            <div className="flex items-start mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{risk.title}</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-600 mb-1">Impact</div>
                    <div className="text-sm font-semibold text-red-600">{risk.impact}</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="text-xs text-gray-600 mb-1">Likelihood</div>
                    <div className="text-sm font-semibold text-orange-600">{risk.likelihood}</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 shadow-sm mb-3">
                  <div className="text-sm font-bold text-gray-900 mb-2">Mitigation Strategies:</div>
                  <ul className="space-y-1.5">
                    {risk.mitigation.map((item, mIdx) => (
                      <li key={mIdx} className="flex items-start text-xs text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-300">
                  <div className="text-xs font-bold text-yellow-900 mb-1">⚠️ Early Warning Signal</div>
                  <div className="text-xs text-yellow-800">{risk.earlyWarning}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Helper function to get progress data for a project
  const getProjectProgress = (projectId) => {
    if (!progressData || !progressData.reports) return null;
    return progressData.reports.find(r => r.projectId === projectId);
  };

  // Helper function to render 3-tier progress bar
  const renderProgressBar = (progress) => {
    if (!progress) {
      return (
        <div className="text-xs text-gray-400 text-center">No data</div>
      );
    }

    const { phases, behavioral, repo } = progress.progressBreakdown;
    const overall = progress.overallProgress;
    const velocity = progress.velocity;

    // Helper to get velocity badge
    const getVelocityBadge = (vel) => {
      if (vel === 'high') return '🚀 High';
      if (vel === 'medium') return '⚡ Med';
      if (vel === 'low') return '🐌 Low';
      return '❓ Unknown';
    };

    // Helper to get velocity color
    const getVelocityColor = (vel) => {
      if (vel === 'high') return 'text-green-600';
      if (vel === 'medium') return 'text-yellow-600';
      if (vel === 'low') return 'text-red-600';
      return 'text-gray-500';
    };

    return (
      <div className="space-y-2">
        {/* Overall Progress */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-gray-700">Overall:</span>
          <span className={`text-sm font-bold ${overall >= 70 ? 'text-green-600' : overall >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
            {overall}%
          </span>
        </div>

        {/* Overall Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${overall >= 70 ? 'bg-green-500' : overall >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${overall}%` }}
          />
        </div>

        {/* 3-Tier Breakdown */}
        <div className="grid grid-cols-3 gap-1 text-xs mt-2">
          {/* Tier 1: Phases */}
          <div className="text-center">
            <div className="font-semibold text-blue-600" title={`Tier 1: Phase Completion\n${phases?.completedPhases || 0}/${phases?.totalPhases || 0} phases\nConfidence: ${phases?.confidence || 'none'}`}>
              T1: {phases?.progress || 0}%
            </div>
            <div className="text-xs text-gray-500">Phases</div>
          </div>

          {/* Tier 2: Behavioral */}
          <div className="text-center">
            <div className="font-semibold text-purple-600" title={`Tier 2: Behavioral Signals\nConfidence: ${behavioral?.confidence || 'none'}`}>
              T2: {behavioral?.progress || 0}%
            </div>
            <div className="text-xs text-gray-500">Usage</div>
          </div>

          {/* Tier 3: GitHub */}
          <div className="text-center">
            {repo ? (
              <>
                <div className="font-semibold text-green-600" title={`Tier 3: GitHub Activity\n${repo.activity?.commitCount || 0} commits, ${repo.activity?.prCount || 0} PRs\nConfidence: ${repo.confidence || 'none'}`}>
                  T3: {repo.progress}%
                </div>
                <div className="text-xs text-gray-500">GitHub</div>
              </>
            ) : (
              <>
                <div className="font-semibold text-gray-400" title="Tier 3: No GitHub data">
                  T3: N/A
                </div>
                <div className="text-xs text-gray-500">GitHub</div>
              </>
            )}
          </div>
        </div>

        {/* Velocity Badge */}
        {velocity && velocity !== 'unknown' && (
          <div className={`text-xs text-center font-semibold ${getVelocityColor(velocity)}`}>
            {getVelocityBadge(velocity)}
          </div>
        )}
      </div>
    );
  };

  const renderPortfolioSlide = () => {
    // Helper function to get tier badge styling
    const getTierBadgeClass = (tierCategory) => {
      switch (tierCategory) {
        case 'foundation':
          return 'bg-blue-100 text-blue-800 border border-blue-300';
        case 'revenue':
          return 'bg-green-100 text-green-800 border border-green-300';
        case 'retention':
          return 'bg-orange-100 text-orange-800 border border-orange-300';
        default:
          return 'bg-gray-100 text-gray-800 border border-gray-300';
      }
    };

    // Helper function to get status dot styling
    const getStatusDotClass = (statusCategory) => {
      switch (statusCategory) {
        case 'active':
          return 'bg-green-500';
        case 'in_progress':
          return 'bg-yellow-500';
        case 'planning':
          return 'bg-blue-400';
        case 'proposed':
          return 'bg-gray-400';
        default:
          return 'bg-gray-300';
      }
    };

    // Helper function to get status text styling
    const getStatusTextClass = (statusCategory) => {
      switch (statusCategory) {
        case 'active':
          return 'text-green-700 font-semibold';
        case 'in_progress':
          return 'text-yellow-700 font-semibold';
        case 'planning':
          return 'text-blue-700';
        case 'proposed':
          return 'text-gray-700';
        default:
          return 'text-gray-600';
      }
    };

    // Helper function to get tier icon
    const getTierIcon = (tierCategory) => {
      switch (tierCategory) {
        case 'foundation':
          return '🔷';
        case 'revenue':
          return '💰';
        case 'retention':
          return '🔄';
        default:
          return '📋';
      }
    };

    return (
      <div className="h-full flex flex-col p-8">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{slide.title}</h2>
          <p className="text-lg text-gray-600">{slide.subtitle}</p>
        </div>

        {/* Methodology Note */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-3 mb-4 rounded-r-lg">
          <p className="text-xs text-blue-900">
            <strong>Formula:</strong> {slide.content.methodology.formula}<br />
            <strong>Components:</strong> {slide.content.methodology.components.join(' • ')}
          </p>
        </div>

        {/* Main Table - Scrollable */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0">
              <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                <th className="px-2 py-2 text-center font-bold text-gray-900" style={{width: '3%'}}>Rank</th>
                <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '14%'}}>Project</th>
                <th className="px-2 py-2 text-center font-bold text-gray-900" style={{width: '4%'}}>Score</th>
                <th className="px-2 py-2 text-center font-bold text-gray-900" style={{width: '12%'}}>Progress (3-Tier)</th>
                <th className="px-2 py-2 text-center font-bold text-gray-900" style={{width: '7%'}}>Tier</th>
                <th className="px-2 py-2 text-center font-bold text-gray-900" style={{width: '7%'}}>Status</th>
                <th className="px-2 py-2 text-right font-bold text-gray-900" style={{width: '5%'}}>Value</th>
                <th className="px-2 py-2 text-right font-bold text-gray-900" style={{width: '5%'}}>ROI</th>
                <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '16%'}}>Target KPIs</th>
                <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '9%'}}>Dependencies</th>
                <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '10%'}}>Q Start</th>
                <th className="px-2 py-2 text-left font-bold text-gray-900" style={{width: '8%'}}>Priority Reasoning</th>
              </tr>
            </thead>
            <tbody>
              {slide.content.projects.map((project, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  {/* Rank */}
                  <td className="px-2 py-2 text-center">
                    <span className="font-bold text-gray-900 text-sm">#{project.rank}</span>
                  </td>

                  {/* Project */}
                  <td className="px-2 py-2">
                    <span className="font-semibold text-gray-900">{project.project}</span>
                  </td>

                  {/* Score */}
                  <td className="px-2 py-2 text-center">
                    <span className="font-bold text-indigo-600">{project.score}</span>
                  </td>

                  {/* Progress (3-Tier) */}
                  <td className="px-2 py-3">
                    {(() => {
                      // Extract project ID from project string (e.g., "OP-000: Title" -> "OP-000")
                      const projectId = project.project.match(/^(OP-\d+)/)?.[1];
                      const progressInfo = getProjectProgress(projectId);
                      return renderProgressBar(progressInfo);
                    })()}
                  </td>

                  {/* Tier */}
                  <td className="px-2 py-2 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getTierBadgeClass(project.tierCategory)}`}>
                      <span className="mr-1">{getTierIcon(project.tierCategory)}</span>
                      {project.tier}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-2 py-2 text-center">
                    <div className="flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full mr-1 ${getStatusDotClass(project.statusCategory)}`}></div>
                      <span className={`text-xs ${getStatusTextClass(project.statusCategory)}`}>{project.status}</span>
                    </div>
                  </td>

                  {/* Value */}
                  <td className="px-2 py-2 text-right">
                    <span className="font-bold text-green-600">{project.value}</span>
                  </td>

                  {/* ROI */}
                  <td className="px-2 py-2 text-right">
                    <span className="font-bold text-green-600">{project.roi}</span>
                  </td>

                  {/* Target KPIs */}
                  <td className="px-2 py-2">
                    <span className="text-xs text-gray-700">{project.targetKPIs}</span>
                  </td>

                  {/* Dependencies */}
                  <td className="px-2 py-2">
                    <span className="text-xs text-gray-700">{project.dependencies}</span>
                  </td>

                  {/* Q Start */}
                  <td className="px-2 py-2">
                    <span className="text-xs text-gray-700">{project.qStartDetail}</span>
                  </td>

                  {/* Priority Reasoning */}
                  <td className="px-2 py-2">
                    <span className="text-xs italic text-gray-600">{project.priorityReasoning}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
            <div className="text-xs font-semibold text-blue-900 mb-1">🔷 TIER 0: FOUNDATION (6)</div>
            <div className="text-xs text-blue-800">Must launch first - enables downstream projects</div>
          </div>
          <div className="bg-green-50 rounded-lg p-2 border border-green-200">
            <div className="text-xs font-semibold text-green-900 mb-1">💰 TIER 1: REVENUE (3)</div>
            <div className="text-xs text-green-800">Revenue generation - after foundation ready</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-2 border border-orange-200">
            <div className="text-xs font-semibold text-orange-900 mb-1">🔄 TIER 2: RETENTION (2)</div>
            <div className="text-xs text-orange-800">Customer retention - after product quality</div>
          </div>
        </div>
      </div>
    );
  };

  // Render appropriate slide type
  switch (slide.type) {
    case 'title':
      return renderTitleSlide();
    case 'metrics':
      return renderMetricsSlide();
    case 'challenges':
      return renderChallengesSlide();
    case 'strategy':
      return renderStrategySlide();
    case 'quarterly':
      return renderQuarterlySlide();
    case 'resources':
      return renderResourcesSlide();
    case 'kpis':
      return renderKPIsSlide();
    case 'risks':
      return renderRisksSlide();
    case 'portfolio':
      return renderPortfolioSlide();
    default:
      return <div className="flex items-center justify-center h-full">Unknown slide type</div>;
  }
};

// Markdown generation functions moved inside component - see AnnualPlanPresentation component
// Function to generate markdown from slidesData (MOVED INSIDE COMPONENT)
const generateMarkdown_OLD = () => {
  let markdown = "# 2026 Annual Plan: Data-Driven, Agile AI Strategy\n\n";
  markdown += "**Presentation for:** CEO Chris Murphy\n";
  markdown += "**Date:** January 6, 2026\n";
  markdown += "**Prepared by:** TechCo Inc Agentic AI Team\n\n";
  markdown += "---\n\n";

  slidesData.forEach((slide, index) => {
    markdown += `# Slide ${index + 1}: ${slide.title}\n\n`;

    if (slide.subtitle) {
      markdown += `**${slide.subtitle}**\n\n`;
    }

    // Generate content based on slide type
    switch (slide.type) {
      case 'title':
        markdown += "## Our Approach\n\n";
        slide.content.approach.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += "\n## The Plan\n\n";
        slide.content.plan.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += "\n## Q1 Commitment\n\n";
        slide.content.q1Commitment.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += "\n*Q2-Q4 Subject to Quarterly Review*\n\n";

        markdown += "---\n**Presenter Notes:**\n\n";
        markdown += "Welcome the CEO and set the tone: this is a data-driven, agile plan. Emphasize that we're celebrating wins (Claude Enterprise 84% adoption, Claude Code 17.6x productivity advantage) while being strategic about future investments. Key message: Q1 is committed, but Q2-Q4 depend on Q1-Q2 results. This is not committing to all 11 projects - we'll review quarterly and re-prioritize based on KPIs and results.\n\n";
        break;

      case 'metrics':
        markdown += "## Claude Enterprise Deployment\n\n";
        slide.content.claudeEnterprise.metrics.forEach(metric => {
          markdown += `- **${metric.label}**: ${metric.value} (${metric.subtext})\n`;
        });
        markdown += "\n## Claude Code Productivity\n\n";
        slide.content.claudeCode.metrics.forEach(metric => {
          markdown += `- **${metric.label}**: ${metric.value} (${metric.subtext})\n`;
        });
        markdown += "\n## Infrastructure Built\n\n";
        slide.content.infrastructure.items.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += "\n## Department Leaders\n\n";
        slide.content.leaders.items.forEach(item => {
          markdown += `- **${item.dept}**: ${item.score} (${item.status})\n`;
        });

        markdown += "\n---\n**Presenter Notes:**\n\n";
        markdown += "Highlight the proven success: 84% adoption, 8.4x engagement advantage, $564K monthly value. Emphasize Claude Code's 17.6x productivity advantage over GitHub Copilot - this is massive. Show the infrastructure we've built (Marketplace, Law2Engine, Dashboard). Point out the department leaders and their high scores. This slide proves AI works at TechCo Inc.\n\n";
        break;

      case 'challenges':
        markdown += "## Critical Coverage Gaps\n\n";
        slide.content.gaps.forEach(gap => {
          markdown += `### ${gap.title}\n\n${gap.details}\n\n`;
        });
        markdown += `## AI Project Portfolio\n\n`;
        markdown += `- **Projects**: ${slide.content.portfolio.projects}\n`;
        markdown += `- **Potential Value**: ${slide.content.portfolio.value}\n`;
        markdown += `- **Challenge**: ${slide.content.portfolio.challenge}\n\n`;
        markdown += "## Strategic Timing\n\n";
        slide.content.timing.forEach(item => {
          markdown += `- ${item}\n`;
        });

        markdown += "\n---\n**Presenter Notes:**\n\n";
        markdown += "Acknowledge the challenges honestly: only 42% Claude Code adoption (losing 17.6x productivity advantage for 26 engineers), need 33 new Premium licenses, revenue teams need enablement. But frame this as opportunity: we have 11 projects worth $22.4M potential value. March 2026 is GitHub Copilot renewal decision - given Claude Code's 17.6x advantage, strong case for consolidation. Q1-Q2 Forever Code deliverables are committed.\n\n";
        break;

      case 'strategy':
        markdown += `## ${slide.content.shortTerm.title}\n\n`;
        slide.content.shortTerm.items.forEach((item, idx) => {
          markdown += `${idx + 1}. ${item}\n`;
        });
        markdown += `\n## ${slide.content.longTerm.title}\n\n`;
        slide.content.longTerm.items.forEach(item => {
          markdown += `- ${item}\n`;
        });
        markdown += "\n## Strategic Priorities\n\n";
        slide.content.priorities.forEach((priority, idx) => {
          markdown += `${idx + 1}. ${priority}\n`;
        });

        markdown += "\n---\n**Presenter Notes:**\n\n";
        markdown += "Explain the two-phase approach: Q1-Q2 is about enabling existing (33 Premium licenses), proving ROI, building foundations (Business Operational Data Foundation), and delivering Forever Code products (80% capacity). Q3-Q4 projects are POTENTIAL and depend on Q1-Q2 success. Champion model must be validated in Q1 before scaling. Note the strategic priorities: dependencies first (licenses, Marketplace, data foundation), then quick wins (high ROI, realistic execution), then champion validation. Emphasize that Q3-Q4 projects only proceed if Q1-Q2 demonstrates success.\n\n";
        break;

      case 'quarterly':
        slide.content.quarters.forEach(q => {
          markdown += `## ${q.quarter}: ${q.subtitle}\n\n`;
          markdown += `**Status**: ${q.status.toUpperCase()}\n\n`;
          markdown += "**Projects**:\n\n";
          q.projects.forEach(project => {
            markdown += `- ${project}\n`;
          });
          markdown += `\n**Capacity**: ${q.capacity}\n`;
          markdown += `**Review Gate**: ${q.reviewGate}\n\n`;
        });

        markdown += "\n---\n**Presenter Notes:**\n\n";
        markdown += "Walk through the quarterly roadmap: Q1 is COMMITTED (72 eng-days for agentification, 80% on Forever Code). Q2-Q4 are POTENTIAL and depend on prior quarter results. Emphasize the capacity growth: 72 → 204 → 408 → 612 engineering-days through champion scaling. Explain the quarterly review gates: March 31 (review Q1, finalize Q2), June 30 (review Q2, finalize Q3), September 30 (review Q3, finalize Q4), December 31 (annual retrospective). This is agile planning - we adapt based on results.\n\n";
        break;

      case 'resources':
        markdown += `**Note**: ${slide.content.note}\n\n`;
        markdown += `## ${slide.content.currentTeam.title}\n\n`;
        markdown += `- **Team Size**: ${slide.content.currentTeam.people}\n`;
        markdown += `- **Commitment**: ${slide.content.currentTeam.commitment}\n`;
        markdown += `- **Q1 Capacity**: ${slide.content.currentTeam.q1Capacity}\n`;
        markdown += `- **Q2 Capacity**: ${slide.content.currentTeam.q2Capacity}\n\n`;
        markdown += `## ${slide.content.championModel.title}\n\n`;
        markdown += `- **Q1 Test**: ${slide.content.championModel.q1Test}\n`;
        markdown += `- **Q2 Scale**: ${slide.content.championModel.q2Scale}\n`;
        slide.content.championModel.breakdown.forEach(item => {
          markdown += `  - ${item}\n`;
        });
        markdown += `- **Q3 Mature**: ${slide.content.championModel.q3Mature}\n`;
        markdown += `- **Q4 Self-Sustaining**: ${slide.content.championModel.q4SelfSustaining}\n\n`;
        markdown += "## Capacity Growth Path\n\n";
        slide.content.capacityGrowth.forEach(item => {
          markdown += `- **${item.quarter}**: ${item.days} eng-days (${item.description})\n`;
        });
        markdown += `\n**Assumptions**: ${slide.content.capacityAssumptions}\n\n`;
        markdown += `## ${slide.content.scenarios.scenarioA.title}\n\n`;
        markdown += `- **Cost**: ${slide.content.scenarios.scenarioA.cost}\n`;
        markdown += `- **Unlock**: ${slide.content.scenarios.scenarioA.unlock}\n`;
        markdown += `- **Enable**: ${slide.content.scenarios.scenarioA.enable}\n`;
        markdown += `- **Value & ROI**: ${slide.content.scenarios.scenarioA.value}\n`;
        markdown += `- **Calculation**: ${slide.content.scenarios.scenarioA.valueCalculation}\n`;
        markdown += `- **Decision Point**: ${slide.content.scenarios.scenarioA.decisionPoint}\n\n`;

        markdown += "---\n**Presenter Notes:**\n\n";
        markdown += "Explain the capacity model: Current team is 6 people at 20% capacity (80% on Forever Code R&D), giving 72 eng-days in Q1. The growth comes from champion scaling: 3-4 champions in Q2 (+120 days), 5-6 in Q3 (+240 days), 8-10 in Q4 (+360 days). This is 8.5x capacity growth WITHOUT hiring. Scenario A is the backup plan: transfer 2 engineers in Q2 if champion model underperforms. This costs $300K but unlocks +$7M value (2,233% ROI) by enabling Sales Deal Intelligence in Q3 and adding Finance/HR projects in Q4. Decision point is Q2 review (June 30).\n\n";
        break;

      case 'kpis':
        markdown += "## Review Cadence\n\n";
        slide.content.cadence.forEach(item => {
          markdown += `- **${item.date}**: ${item.description}\n`;
        });
        markdown += "\n## Project-Level KPIs\n\n";
        slide.content.projectKPIs.forEach(kpi => {
          markdown += `### ${kpi.name}\n\n${kpi.description}\n\n`;
        });
        markdown += "## Portfolio-Level KPIs\n\n";
        slide.content.portfolioKPIs.forEach(kpi => {
          markdown += `- ${kpi}\n`;
        });

        markdown += "\n---\n**Presenter Notes:**\n\n";
        markdown += "Emphasize the quarterly review process: 4 reviews throughout the year to stay agile and re-prioritize. Each project tracks 4 KPIs: Delivery Health (green/yellow/red), Adoption Rate (>60% target), ROI Realization (actual vs forecast), and User Sentiment (>70 score target). Portfolio-level KPIs are based on current adoption metrics (Claude Enterprise 84%, Claude Code 42% → 70% Q1 target → 80% Q2 target). Important note: These are starting point KPIs. Real KPIs TBD in Q1 as we transition from adoption metrics to value realization metrics (actual business outcomes, revenue impact, time savings realized vs forecasted).\n\n";
        break;

      case 'risks':
        slide.content.risks.forEach(risk => {
          markdown += `## ${risk.title}\n\n`;
          markdown += `- **Impact**: ${risk.impact}\n`;
          markdown += `- **Likelihood**: ${risk.likelihood}\n\n`;
          markdown += "**Mitigation Strategies**:\n\n";
          risk.mitigation.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += `\n**Early Warning Signal**: ${risk.earlyWarning}\n\n`;
        });

        markdown += "---\n**Presenter Notes:**\n\n";
        markdown += "Address the three key risks honestly: (1) Champion model might not scale - mitigated by Q1 validation and Scenario A backup plan. (2) Forever Code delays might impact capacity - mitigated by 80% capacity firewall and quarterly review adjustments. (3) External dependencies (Gong MCP, Salesforce MCP) might not mature - scheduled for Q4 to give 12+ months maturity time, with Q3 go/no-go decision. Emphasize early warning signals and mitigation strategies. We have buffers (14-52 days per quarter) and backup plans (Scenario A).\n\n";
        break;

      case 'portfolio':
        markdown += `**Formula**: ${slide.content.methodology.formula}\n\n`;
        markdown += `**Components**: ${slide.content.methodology.components.join(' • ')}\n\n`;
        markdown += "## Projects Ranked by Hybrid Score\n\n";
        slide.content.projects.forEach(project => {
          markdown += `### #${project.rank} - ${project.project} (Score: ${project.score})\n\n`;
          markdown += `- **Tier**: ${project.tier}\n`;
          markdown += `- **Status**: ${project.status}\n`;
          markdown += `- **Value**: ${project.value} | **ROI**: ${project.roi}\n`;
          markdown += `- **Target KPIs**: ${project.targetKPIs}\n`;
          markdown += `- **Dependencies**: ${project.dependencies}\n`;
          markdown += `- **Q Start**: ${project.qStartDetail}\n`;
          markdown += `- **Priority Reasoning**: ${project.priorityReasoning}\n\n`;
        });

        markdown += "---\n**Presenter Notes:**\n\n";
        markdown += "Walk through the portfolio scoring methodology: 70% multi-factor (Financial Impact 30%, Strategic Alignment 25%, Execution Feasibility 25%, Time to Value 20%) + 30% ROI. Point out the three tiers: TIER 0 Foundation (6 projects - must launch first), TIER 1 Revenue (3 projects - after foundation ready), TIER 2 Retention (2 projects - after product quality). Highlight the top 5: OP-000 (licenses - score 95.6, foundational), OP-011 (Marketplace - score 81.7, prevents $369K duplicate efforts), OP-014 (Data Foundation - score 85.5, feeds 7+ projects), OP-005 (Lead Gen - score 86.2, $3.1M value), OP-008 (Law2Engine - score 68.8, 60% complete). Note that OP-001 (Sales Deal Intelligence) has highest value ($5-7M, 847% ROI) but scheduled for Q4 due to external dependencies (Gong + Salesforce MCPs need maturity).\n\n";
        break;

      default:
        markdown += "*[Content not rendered]*\n\n";
    }

    markdown += "---\n\n";
  });

  markdown += "# END OF PRESENTATION\n\n";
  markdown += "**Questions?**\n\n";
  markdown += "**Next Steps**: Review Q1 commitments, approve budget for 33 Premium licenses, schedule quarterly review on March 31, 2026.\n";

  return markdown;
};

// Function to trigger markdown download (MOVED INSIDE COMPONENT)
const downloadMarkdown_OLD = () => {
  const markdown = generateMarkdown_OLD();
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '2026-annual-plan-presentation.md';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const AnnualPlanPresentation = ({ aiToolsData, portfolioData }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressData, setProgressData] = useState(null);

  // Calculate metrics from live data - use latest COMPLETE month for decisions
  const calculateMetrics = () => {
    if (!aiToolsData) return null;

    // Find latest complete month (totalDaysInMonth >= 28 indicates full month)
    const ceMonthly = aiToolsData.claudeEnterprise.monthlyTrend || [];
    const completeMonths = ceMonthly.filter(m => m.totalDaysInMonth >= 28);
    const latestCompleteMonth = completeMonths[completeMonths.length - 1];
    const partialMonth = ceMonthly[ceMonthly.length - 1];

    // Check if latest month is partial
    const isPartialMonth = partialMonth && partialMonth.totalDaysInMonth < 28;

    // Calculate adoption rate
    const adoption = Math.round((aiToolsData.claudeEnterprise.activeUsers / aiToolsData.claudeEnterprise.licensedUsers) * 100);

    // Get productivity multiplier
    const productivityMultiplier = aiToolsData.productivityComparisons?.claudeCodeVsGithubCopilot?.productivityMultiplier || 17.6;

    // Get engagement multiplier
    const engagementMultiplier = aiToolsData.productivityComparisons?.claudeEnterpriseVsM365?.engagementMultiplier || 8.4;

    // Calculate Claude Code adoption (active users / licensed users)
    const claudeCodeAdoption = Math.round((aiToolsData.claudeCode.activeUsers / aiToolsData.claudeCode.licensedUsers) * 100);

    return {
      claudeEnterprise: {
        licensedUsers: aiToolsData.claudeEnterprise.licensedUsers,
        activeUsers: aiToolsData.claudeEnterprise.activeUsers,
        adoption: `${adoption}%`,
        adoptionNumeric: adoption,
        adoptionSubtext: `${aiToolsData.claudeEnterprise.activeUsers} of ${aiToolsData.claudeEnterprise.licensedUsers} licensed users`,
        engagementMultiplier: `${engagementMultiplier.toFixed(1)}x`,
        engagementMultiplierNumeric: engagementMultiplier,
        latestCompleteMonth: latestCompleteMonth,
        isPartialMonth: isPartialMonth
      },
      claudeCode: {
        productivityMultiplier: `${productivityMultiplier.toFixed(1)}x`,
        productivityMultiplierNumeric: productivityMultiplier,
        totalLines: aiToolsData.claudeCode.totalLines.toLocaleString(),
        activeUsers: aiToolsData.claudeCode.activeUsers,
        licensedUsers: aiToolsData.claudeCode.licensedUsers,
        adoption: claudeCodeAdoption,
        adoptionText: `${claudeCodeAdoption}% Claude Code adoption (${aiToolsData.claudeCode.activeUsers} of ${aiToolsData.claudeCode.licensedUsers} engineers)`
      }
    };
  };

  const metrics = calculateMetrics();

  // Load progress data
  useEffect(() => {
    fetch('/ai-projects-progress.json')
      .then(res => res.json())
      .then(data => setProgressData(data))
      .catch(err => console.error('Failed to load progress data:', err));
  }, []);

  // Generate slides data with live metrics
  const slidesData = getSlidesData(metrics, portfolioData);

  // Function to generate markdown from slidesData with dynamic metrics
  const generateMarkdown = () => {
    // Extract dynamic values for presenter notes
    const ceAdoption = metrics?.claudeEnterprise.adoption || "84%";
    const ceEngagement = metrics?.claudeEnterprise.engagementMultiplier || "8.4x";
    const ccProductivity = metrics?.claudeCode.productivityMultiplier || "17.6x";
    const ccAdoptionNumeric = metrics?.claudeCode.adoption || 42;
    const ceAdoptionNumeric = metrics?.claudeEnterprise.adoptionNumeric || 84;

    let markdown = "# 2026 Annual Plan: Data-Driven, Agile AI Strategy\n\n";
    markdown += "**Presentation for:** CEO Chris Murphy\n";
    markdown += "**Date:** January 6, 2026\n";
    markdown += "**Prepared by:** TechCo Inc Agentic AI Team\n\n";
    markdown += "---\n\n";

    slidesData.forEach((slide, index) => {
      markdown += `# Slide ${index + 1}: ${slide.title}\n\n`;

      if (slide.subtitle) {
        markdown += `**${slide.subtitle}**\n\n`;
      }

      // Generate content based on slide type
      switch (slide.type) {
        case 'title':
          markdown += "## Our Approach\n\n";
          slide.content.approach.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += "\n## The Plan\n\n";
          slide.content.plan.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += "\n## Q1 Commitment\n\n";
          slide.content.q1Commitment.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += "\n*Q2-Q4 Subject to Quarterly Review*\n\n";
          markdown += "---\n**Presenter Notes:**\n\n";
          markdown += `Welcome the CEO and set the tone: this is a data-driven, agile plan. Emphasize that we're celebrating wins (Claude Enterprise ${ceAdoption} adoption, Claude Code ${ccProductivity} productivity advantage) while being strategic about future investments. Key message: Q1 is committed, but Q2-Q4 depend on Q1-Q2 results. This is not committing to all 11 projects - we'll review quarterly and re-prioritize based on KPIs and results.\n\n`;
          break;

        case 'metrics':
          markdown += "## Claude Enterprise Deployment\n\n";
          slide.content.claudeEnterprise.metrics.forEach(metric => {
            markdown += `- **${metric.label}**: ${metric.value} (${metric.subtext})\n`;
          });
          markdown += "\n## Claude Code Productivity\n\n";
          slide.content.claudeCode.metrics.forEach(metric => {
            markdown += `- **${metric.label}**: ${metric.value} (${metric.subtext})\n`;
          });
          markdown += "\n## Infrastructure Built\n\n";
          slide.content.infrastructure.items.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += "\n## Department Leaders\n\n";
          slide.content.leaders.items.forEach(item => {
            markdown += `- **${item.dept}**: ${item.score} (${item.status})\n`;
          });
          markdown += "\n---\n**Presenter Notes:**\n\n";
          markdown += `Highlight the proven success: ${ceAdoption} adoption, ${ceEngagement} engagement advantage, $564K monthly value. Emphasize Claude Code's ${ccProductivity} productivity advantage over GitHub Copilot - this is massive. Show the infrastructure we've built (Marketplace, Law2Engine, Dashboard). Point out the department leaders and their high scores. This slide proves AI works at TechCo Inc.\n\n`;
          break;

        case 'challenges':
          markdown += "## Critical Coverage Gaps\n\n";
          slide.content.gaps.forEach(gap => {
            markdown += `### ${gap.title}\n\n${gap.details}\n\n`;
          });
          markdown += `## AI Project Portfolio\n\n`;
          markdown += `- **Projects**: ${slide.content.portfolio.projects}\n`;
          markdown += `- **Potential Value**: ${slide.content.portfolio.value}\n`;
          markdown += `- **Challenge**: ${slide.content.portfolio.challenge}\n\n`;
          markdown += "## Strategic Timing\n\n";
          slide.content.timing.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += "\n---\n**Presenter Notes:**\n\n";
          markdown += `Acknowledge the challenges honestly: only ${ccAdoptionNumeric}% Claude Code adoption (losing ${ccProductivity} productivity advantage for ${metrics?.claudeCode.licensedUsers - metrics?.claudeCode.activeUsers || 26} engineers), need 33 new Premium licenses, revenue teams need enablement. But frame this as opportunity: we have 11 projects worth $22.4M potential value. March 2026 is GitHub Copilot renewal decision - given Claude Code's ${ccProductivity} advantage, strong case for consolidation. Q1-Q2 Forever Code deliverables are committed.\n\n`;
          break;

        case 'strategy':
          markdown += `## ${slide.content.shortTerm.title}\n\n`;
          slide.content.shortTerm.items.forEach((item, idx) => {
            markdown += `${idx + 1}. ${item}\n`;
          });
          markdown += `\n## ${slide.content.longTerm.title}\n\n`;
          slide.content.longTerm.items.forEach(item => {
            markdown += `- ${item}\n`;
          });
          markdown += "\n## Strategic Priorities\n\n";
          slide.content.priorities.forEach((priority, idx) => {
            markdown += `${idx + 1}. ${priority}\n`;
          });
          markdown += "\n---\n**Presenter Notes:**\n\n";
          markdown += "Explain the two-phase approach: Q1-Q2 is about enabling existing (33 Premium licenses), proving ROI, building foundations (Business Operational Data Foundation), and delivering Forever Code products (80% capacity). Q3-Q4 projects are POTENTIAL and depend on Q1-Q2 success. Champion model must be validated in Q1 before scaling. Note the strategic priorities: dependencies first (licenses, Marketplace, data foundation), then quick wins (high ROI, realistic execution), then champion validation. Emphasize that Q3-Q4 projects only proceed if Q1-Q2 demonstrates success.\n\n";
          break;

        case 'quarterly':
          slide.content.quarters.forEach(q => {
            markdown += `## ${q.quarter}: ${q.subtitle}\n\n`;
            markdown += `**Status**: ${q.status.toUpperCase()}\n\n`;
            markdown += "**Projects**:\n\n";
            q.projects.forEach(project => {
              markdown += `- ${project}\n`;
            });
            markdown += `\n**Capacity**: ${q.capacity}\n`;
            markdown += `**Review Gate**: ${q.reviewGate}\n\n`;
          });
          markdown += "\n---\n**Presenter Notes:**\n\n";
          markdown += "Walk through the quarterly roadmap: Q1 is COMMITTED (72 eng-days for agentification, 80% on Forever Code). Q2-Q4 are POTENTIAL and depend on prior quarter results. Emphasize the capacity growth: 72 → 204 → 408 → 612 engineering-days through champion scaling. Explain the quarterly review gates: March 31 (review Q1, finalize Q2), June 30 (review Q2, finalize Q3), September 30 (review Q3, finalize Q4), December 31 (annual retrospective). This is agile planning - we adapt based on results.\n\n";
          break;

        case 'resources':
          markdown += `**Note**: ${slide.content.note}\n\n`;
          markdown += `## ${slide.content.currentTeam.title}\n\n`;
          markdown += `- **Team Size**: ${slide.content.currentTeam.people}\n`;
          markdown += `- **Commitment**: ${slide.content.currentTeam.commitment}\n`;
          markdown += `- **Q1 Capacity**: ${slide.content.currentTeam.q1Capacity}\n`;
          markdown += `- **Q2 Capacity**: ${slide.content.currentTeam.q2Capacity}\n\n`;
          markdown += `## ${slide.content.championModel.title}\n\n`;
          markdown += `- **Q1 Test**: ${slide.content.championModel.q1Test}\n`;
          markdown += `- **Q2 Scale**: ${slide.content.championModel.q2Scale}\n`;
          slide.content.championModel.breakdown.forEach(item => {
            markdown += `  - ${item}\n`;
          });
          markdown += `- **Q3 Mature**: ${slide.content.championModel.q3Mature}\n`;
          markdown += `- **Q4 Self-Sustaining**: ${slide.content.championModel.q4SelfSustaining}\n\n`;
          markdown += "## Capacity Growth Path\n\n";
          slide.content.capacityGrowth.forEach(item => {
            markdown += `- **${item.quarter}**: ${item.days} eng-days (${item.description})\n`;
          });
          markdown += `\n**Assumptions**: ${slide.content.capacityAssumptions}\n\n`;
          markdown += `## ${slide.content.scenarios.scenarioA.title}\n\n`;
          markdown += `- **Cost**: ${slide.content.scenarios.scenarioA.cost}\n`;
          markdown += `- **Unlock**: ${slide.content.scenarios.scenarioA.unlock}\n`;
          markdown += `- **Enable**: ${slide.content.scenarios.scenarioA.enable}\n`;
          markdown += `- **Value & ROI**: ${slide.content.scenarios.scenarioA.value}\n`;
          markdown += `- **Calculation**: ${slide.content.scenarios.scenarioA.valueCalculation}\n`;
          markdown += `- **Decision Point**: ${slide.content.scenarios.scenarioA.decisionPoint}\n\n`;
          markdown += "---\n**Presenter Notes:**\n\n";
          markdown += "Explain the capacity model: Current team is 6 people at 20% capacity (80% on Forever Code R&D), giving 72 eng-days in Q1. The growth comes from champion scaling: 3-4 champions in Q2 (+120 days), 5-6 in Q3 (+240 days), 8-10 in Q4 (+360 days). This is 8.5x capacity growth WITHOUT hiring. Scenario A is the backup plan: transfer 2 engineers in Q2 if champion model underperforms. This costs $300K but unlocks +$7M value (2,233% ROI) by enabling Sales Deal Intelligence in Q3 and adding Finance/HR projects in Q4. Decision point is Q2 review (June 30).\n\n";
          break;

        case 'kpis':
          markdown += "## Review Cadence\n\n";
          slide.content.cadence.forEach(item => {
            markdown += `- **${item.date}**: ${item.description}\n`;
          });
          markdown += "\n## Project-Level KPIs\n\n";
          slide.content.projectKPIs.forEach(kpi => {
            markdown += `### ${kpi.name}\n\n${kpi.description}\n\n`;
          });
          markdown += "## Portfolio-Level KPIs\n\n";
          slide.content.portfolioKPIs.forEach(kpi => {
            markdown += `- ${kpi}\n`;
          });
          markdown += "\n---\n**Presenter Notes:**\n\n";
          markdown += `Emphasize the quarterly review process: 4 reviews throughout the year to stay agile and re-prioritize. Each project tracks 4 KPIs: Delivery Health (green/yellow/red), Adoption Rate (>60% target), ROI Realization (actual vs forecast), and User Sentiment (>70 score target). Portfolio-level KPIs are based on current adoption metrics (Claude Enterprise ${ceAdoptionNumeric}%, Claude Code ${ccAdoptionNumeric}% → 70% Q1 target → 80% Q2 target). Important note: These are starting point KPIs. Real KPIs TBD in Q1 as we transition from adoption metrics to value realization metrics (actual business outcomes, revenue impact, time savings realized vs forecasted).\n\n`;
          break;

        case 'risks':
          slide.content.risks.forEach(risk => {
            markdown += `## ${risk.title}\n\n`;
            markdown += `- **Impact**: ${risk.impact}\n`;
            markdown += `- **Likelihood**: ${risk.likelihood}\n\n`;
            markdown += "**Mitigation Strategies**:\n\n";
            risk.mitigation.forEach(item => {
              markdown += `- ${item}\n`;
            });
            markdown += `\n**Early Warning Signal**: ${risk.earlyWarning}\n\n`;
          });
          markdown += "---\n**Presenter Notes:**\n\n";
          markdown += "Address the three key risks honestly: (1) Champion model might not scale - mitigated by Q1 validation and Scenario A backup plan. (2) Forever Code delays might impact capacity - mitigated by 80% capacity firewall and quarterly review adjustments. (3) External dependencies (Gong MCP, Salesforce MCP) might not mature - scheduled for Q4 to give 12+ months maturity time, with Q3 go/no-go decision. Emphasize early warning signals and mitigation strategies. We have buffers (14-52 days per quarter) and backup plans (Scenario A).\n\n";
          break;

        case 'portfolio':
          markdown += `**Formula**: ${slide.content.methodology.formula}\n\n`;
          markdown += `**Components**: ${slide.content.methodology.components.join(' • ')}\n\n`;
          markdown += "## Projects Ranked by Hybrid Score\n\n";
          slide.content.projects.forEach(project => {
            markdown += `### #${project.rank} - ${project.project} (Score: ${project.score})\n\n`;
            markdown += `- **Tier**: ${project.tier}\n`;
            markdown += `- **Status**: ${project.status}\n`;
            markdown += `- **Value**: ${project.value} | **ROI**: ${project.roi}\n`;
            markdown += `- **Target KPIs**: ${project.targetKPIs}\n`;
            markdown += `- **Dependencies**: ${project.dependencies}\n`;
            markdown += `- **Q Start**: ${project.qStartDetail}\n`;
            markdown += `- **Priority Reasoning**: ${project.priorityReasoning}\n\n`;
          });
          markdown += "---\n**Presenter Notes:**\n\n";
          markdown += "Walk through the portfolio scoring methodology: 70% multi-factor (Financial Impact 30%, Strategic Alignment 25%, Execution Feasibility 25%, Time to Value 20%) + 30% ROI. Point out the three tiers: TIER 0 Foundation (6 projects - must launch first), TIER 1 Revenue (3 projects - after foundation ready), TIER 2 Retention (2 projects - after product quality). Highlight the top 5: OP-000 (licenses - score 95.6, foundational), OP-011 (Marketplace - score 81.7, prevents $369K duplicate efforts), OP-014 (Data Foundation - score 85.5, feeds 7+ projects), OP-005 (Lead Gen - score 86.2, $3.1M value), OP-008 (Law2Engine - score 68.8, 60% complete). Note that OP-001 (Sales Deal Intelligence) has highest value ($5-7M, 847% ROI) but scheduled for Q4 due to external dependencies (Gong + Salesforce MCPs need maturity).\n\n";
          break;

        default:
          markdown += "*[Content not rendered]*\n\n";
      }

      markdown += "---\n\n";
    });

    markdown += "# END OF PRESENTATION\n\n";
    markdown += "**Questions?**\n\n";
    markdown += "**Next Steps**: Review Q1 commitments, approve budget for 33 Premium licenses, schedule quarterly review on March 31, 2026.\n";

    return markdown;
  };

  // Function to trigger markdown download
  const downloadMarkdown = () => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '2026-annual-plan-presentation.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isFullscreen]);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slidesData.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  const currentSlideData = slidesData[currentSlide];

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col">
      {/* Header - Only show if not in fullscreen */}
      {!isFullscreen && (
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">2026 Annual Plan Presentation</h1>
            <p className="text-sm text-gray-600">For CEO Chris Murphy • January 6, 2026, 2:00 PM EST</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={downloadMarkdown}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              title="Download presentation as markdown file for use with /powerpoint:create plugin"
            >
              <Download className="h-4 w-4" />
              <span>Download Markdown</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Enter Presentation Mode (F)
            </button>
          </div>
        </div>
      )}

      {/* Slide Container */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full h-full max-w-[1400px] bg-white rounded-lg shadow-2xl overflow-hidden relative">
          <Slide
            slide={currentSlideData}
            slideNumber={currentSlide + 1}
            totalSlides={slidesData.length}
            progressData={progressData}
          />

          {/* Navigation Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-6">
            <div className="flex items-center justify-between text-white">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium">Previous</span>
              </button>

              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {currentSlide + 1} / {slidesData.length}
                </div>
                <div className="flex space-x-1">
                  {slidesData.map((_, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full cursor-pointer transition-all ${
                        idx === currentSlide
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={nextSlide}
                disabled={currentSlide === slidesData.length - 1}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span className="text-sm font-medium">Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {!isFullscreen && (
              <div className="mt-4 text-center text-xs text-white/80">
                ← → or Space to navigate • F for fullscreen • ESC to exit
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions overlay in fullscreen */}
      {isFullscreen && currentSlide === 0 && (
        <div className="absolute top-4 right-4 bg-black/75 text-white px-4 py-2 rounded-lg text-xs animate-fade-in">
          ← → Space: Navigate • F: Exit Fullscreen • ESC: Exit
        </div>
      )}
    </div>
  );
};

export default AnnualPlanPresentation;
