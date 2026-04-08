export function getAIResponse(text, conversationHistory = []) {
  const lower = text.toLowerCase();

  if (/vaccine|vaccination|coverage|immunis|immuniz/.test(lower)) {
    return {
      text: `<strong>🔬 Vaccine Coverage Analysis</strong><br><br>
Current coverage by district:<br>
<ul>
  <li><strong>Rural Zone B:</strong> 68% — <span style="color:#D13438">⚠ Critical gap (target 85%)</span></li>
  <li><strong>Northern District:</strong> 74% — below target</li>
  <li><strong>Eastern District:</strong> 71% — below target</li>
  <li><strong>Central District:</strong> 81% — near target</li>
  <li><strong>Southern District:</strong> 83% — near target</li>
  <li><strong>Western District:</strong> 79% — below target</li>
</ul>
<br><strong>Recommended Actions:</strong>
<ul>
  <li>Deploy 3 mobile vaccination units to Rural Zone B immediately</li>
  <li>Prioritise 4,200 unvaccinated residents in high-risk age cohorts (65+)</li>
  <li>Partner with community leaders in Northern and Eastern districts</li>
  <li>Estimated timeline to reach 85% target: 3–4 weeks with recommended resources</li>
</ul>`,
      suggestionsAfter: [
        'How many mobile units are needed?',
        'Show cost analysis for vaccination drive',
        'Generate intervention approval request'
      ]
    };
  }

  if (/social|case.*risk|risk.*case|casework/.test(lower)) {
    return {
      text: `<strong>👥 High-Risk Social Cases Summary</strong><br><br>
Top priority cases requiring immediate attention:<br>
<ul>
  <li><strong>Risk 92/100</strong> — Housing Crisis, Eastern District (family of 4, eviction risk)</li>
  <li><strong>Risk 88/100</strong> — Mental Health Crisis, Northern District (homeless, acute risk)</li>
  <li><strong>Risk 85/100</strong> — Child Safeguarding, Western District (3 children, neglect concern)</li>
  <li><strong>Risk 79/100</strong> — Substance Dependency, Northern District (rough sleeping)</li>
</ul>
<br>Total open cases: <strong>6</strong> | Average risk score: <strong>79.8</strong><br>
<br>⚠ 3 cases exceed the 80-point escalation threshold. Consider convening multi-agency review.`,
      suggestionsAfter: [
        'What resources are available for housing cases?',
        'Show caseworker capacity by district',
        'Generate social services report'
      ]
    };
  }

  if (/brief|executive|summary|today|overview/.test(lower)) {
    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return {
      text: `<strong>📋 Executive Health Briefing — ${today}</strong><br><br>
<strong>SITUATION OVERVIEW</strong><br>
2.4M citizens monitored across 5 districts. System operating normally with 7 active alerts.<br><br>
<strong>🚨 Priority Items:</strong>
<ul>
  <li>Respiratory surge in Eastern District (+34% WoW) — <strong>IMMEDIATE ACTION REQUIRED</strong></li>
  <li>Vaccine coverage gap in Rural Zone B (68% vs 85% target)</li>
  <li>Wastewater SARS-CoV-2 signal elevated in Sector 4 (+22% WoW)</li>
</ul>
<strong>✅ Positive Indicators:</strong>
<ul>
  <li>Hepatitis A outbreak in Southern District declining (−12% WoW)</li>
  <li>847 housing placements completed this quarter (+12% vs target)</li>
  <li>AI models operating at 94% confidence — early warning system nominal</li>
</ul>
<br><em>Recommendation: Convene emergency district health committee for Eastern District surge response.</em>`,
      suggestionsAfter: [
        'Forecast Eastern District trajectory',
        'What interventions are pending approval?',
        'Generate printable PDF report'
      ]
    };
  }

  if (/hospital|capacity|beds|icu|admit/.test(lower)) {
    return {
      text: `<strong>🏥 Hospital Capacity Forecast — Next 30 Days</strong><br><br>
Current system-wide bed utilisation: <strong>78%</strong><br><br>
<strong>Projected demand (respiratory surge scenario):</strong>
<ul>
  <li><strong>Day 7:</strong> 83% utilisation — monitoring threshold breached</li>
  <li><strong>Day 14:</strong> 91% utilisation — surge protocol recommended</li>
  <li><strong>Day 21:</strong> 97% utilisation — <span style="color:#D13438">critical without intervention</span></li>
  <li><strong>Day 30:</strong> 94% utilisation (peak predicted Day 19-22)</li>
</ul>
<br><strong>Recommended Actions:</strong>
<ul>
  <li>Pre-activate surge beds at Eastern District General (150 additional)</li>
  <li>Divert non-urgent elective procedures from Week 2</li>
  <li>Coordinate mutual aid agreement with neighbouring trusts</li>
  <li>Increase community care capacity to reduce unnecessary admissions</li>
</ul>`,
      suggestionsAfter: [
        'Show staffing requirements for surge',
        'What is the cost of pre-activating surge beds?',
        'Generate hospital capacity report'
      ]
    };
  }

  if (/outbreak|surge|respiratory|eastern/.test(lower)) {
    return {
      text: `<strong>🦠 Respiratory Surge — Eastern District Root Cause Analysis</strong><br><br>
The AI model has identified <strong>3 primary contributing factors</strong>:<br>
<ul>
  <li><strong>1. Vaccine coverage gap (71%):</strong> Below herd immunity threshold, enabling faster transmission in unvaccinated cohorts</li>
  <li><strong>2. Cold weather aggregation:</strong> Indoor gatherings increased 40% since October — prime transmission conditions</li>
  <li><strong>3. Healthcare worker shortage:</strong> Eastern District running at 87% staffing capacity, reducing early case identification</li>
</ul>
<br><strong>Immediate Actions Required:</strong>
<ul>
  <li>🚨 Activate respiratory surge protocol (Tier 2)</li>
  <li>Deploy rapid antigen testing to 12 community sites</li>
  <li>Issue public health advisory for high-risk groups</li>
  <li>Pre-position antiviral stockpile at Eastern District General</li>
</ul>
<br>AI confidence in trajectory model: <strong>94%</strong>. Without intervention, cases projected to peak at ~1,200/week in 14 days.`,
      suggestionsAfter: [
        'What resources are needed for surge protocol?',
        'Show 30-day trajectory forecast',
        'What is the hospital capacity impact?'
      ]
    };
  }

  if (/wastewater|sector 4|environmental|sewage/.test(lower)) {
    return {
      text: `<strong>🔬 Wastewater Surveillance — Sector 4 Analysis</strong><br><br>
Current SARS-CoV-2 signal: <strong>8.1 copies/mL</strong> (22% WoW increase)<br><br>
<strong>Signal Interpretation:</strong>
<ul>
  <li>Wastewater signal typically leads clinical cases by <strong>8–12 days</strong></li>
  <li>Current trajectory suggests clinical surge likely around <strong>16–20 April</strong></li>
  <li>Signal covers approximately <strong>18,000 residents</strong> in Sector 4 catchment</li>
  <li>Comparison: Eastern District wastewater signal preceded current surge by 10 days</li>
</ul>
<br><strong>Proactive Measures Recommended:</strong>
<ul>
  <li>Pre-position testing capacity in Sector 4 community centres</li>
  <li>Alert local GPs and pharmacies to increased demand</li>
  <li>Inform Sector 4 residents via public health communication</li>
  <li>Schedule follow-up wastewater sample for 72 hours</li>
</ul>`,
      suggestionsAfter: [
        'What is the population at risk in Sector 4?',
        'Compare to Eastern District wastewater signal',
        'Generate public health advisory draft'
      ]
    };
  }

  if (/forecast|predict|trajectory|next.*week|next.*month/.test(lower)) {
    return {
      text: `<strong>📈 30-Day Disease Trajectory Forecast</strong><br><br>
<strong>Scenario A — No Intervention:</strong>
<ul>
  <li>ILI cases: 447 → 1,240/week (peak Day 22)</li>
  <li>Respiratory admissions: +340% vs current</li>
  <li>Estimated additional burden: 8,200 cases</li>
</ul>
<strong>Scenario B — Recommended Interventions Applied:</strong>
<ul>
  <li>ILI cases: 447 → 680/week (peak Day 18, earlier containment)</li>
  <li>Respiratory admissions: +80% vs current (manageable)</li>
  <li>Cases averted: ~4,100 through early action</li>
</ul>
<br>⚡ <strong>Cost difference:</strong> Intervention scenario saves an estimated £2.1M in acute care costs.<br><br>
<em>Model confidence: 89%. Based on historical R-value, current vaccination coverage, and weather patterns.</em>`,
      suggestionsAfter: [
        'Break down the cost savings estimate',
        'What interventions drive Scenario B outcomes?',
        'Generate full forecast report'
      ]
    };
  }

  if (/cost|budget|saving|avoidance|£|finance/.test(lower)) {
    return {
      text: `<strong>💰 Cost Avoidance Analysis — Q2 2026</strong><br><br>
Estimated savings from AI-driven early intervention this quarter:<br>
<ul>
  <li><strong>Early outbreak detection:</strong> £1.4M saved (avg 8 days earlier = fewer acute admissions)</li>
  <li><strong>Automated risk triage:</strong> £620K saved (71% reduction in manual screening hours)</li>
  <li><strong>SDOH early intervention:</strong> £890K saved (preventing crisis escalation for 847 cases)</li>
  <li><strong>Vaccine programme optimisation:</strong> £340K saved (targeted deployment vs blanket campaign)</li>
</ul>
<br><strong>Total estimated Q2 cost avoidance: £3.25M</strong><br>
Platform investment: £420K/quarter<br>
<strong>ROI: 7.7× return on investment</strong><br><br>
<em>Note: Figures are modelled estimates based on NHS reference costs and avoided utilisation data.</em>`,
      suggestionsAfter: [
        'Show ROI breakdown by programme area',
        'How does this compare to Q1?',
        'Generate finance summary report'
      ]
    };
  }

  if (/report|generate|export|pdf/.test(lower)) {
    return {
      text: `<strong>📄 Report Generation</strong><br><br>
I can generate a comprehensive Executive Health Analytics Report including:<br>
<ul>
  <li>KPI snapshot and trend analysis</li>
  <li>Active alerts and risk summary</li>
  <li>Disease surveillance overview</li>
  <li>Intervention recommendations</li>
  <li>Social services caseload summary</li>
</ul>
<br>Click <strong>"Generate Report"</strong> in the chat header to create a formatted briefing document ready for print or PDF export.`,
      suggestionsAfter: [
        'Generate executive briefing now',
        'Include financial summary in report',
        'Export outbreak data as CSV'
      ]
    };
  }

  if (/mental health|wellbeing|anxiety|depression|psych/.test(lower)) {
    return {
      text: `<strong>🧠 Mental Health Indicators — Current Analysis</strong><br><br>
System-wide mental health data (latest reporting period):<br>
<ul>
  <li><strong>Eastern District:</strong> 14.2% prevalence — highest district, linked to unemployment rate (12.4%)</li>
  <li><strong>Northern District:</strong> 13.4% prevalence — rising, RSV outbreak stress contributing</li>
  <li><strong>National benchmark:</strong> 11.8% — 3 of 5 districts above benchmark</li>
</ul>
<br><strong>AI-Identified Risk Factors:</strong>
<ul>
  <li>Prolonged winter isolation in Northern and Eastern districts</li>
  <li>Economic hardship correlation with benefit claimant rate (+18%)</li>
  <li>Post-pandemic long-term conditions in 65+ cohort</li>
</ul>
<br><strong>Recommended Outreach Plan:</strong>
<ul>
  <li>Deploy 2 additional mental health practitioners to Eastern District</li>
  <li>Launch digital wellbeing signposting via community pharmacies</li>
  <li>Integrate mental health screening into routine GP appointments</li>
</ul>`,
      suggestionsAfter: [
        'What mental health services are available?',
        'Show mental health referral pathway',
        'Generate mental health action plan'
      ]
    };
  }

  if (/food|nutrition|insecurity|hunger|food bank/.test(lower)) {
    return {
      text: `<strong>🍎 Food Security Analysis</strong><br><br>
Current food insecurity programme coverage: <strong>54%</strong> of identified need<br><br>
<strong>Key Gaps Identified:</strong>
<ul>
  <li><strong>Rural Zone B:</strong> 1 food bank for 8,400 residents — 2.4× recommended ratio</li>
  <li><strong>Eastern District:</strong> Benefits processing delays (avg 6.2 weeks) driving acute need</li>
  <li><strong>Northern District:</strong> Weekend provision gap — no weekend food access for 2,100 residents</li>
</ul>
<br><strong>Recommended Programme Expansions:</strong>
<ul>
  <li>Open satellite food bank in Rural Zone B (est. cost £18K setup)</li>
  <li>Establish emergency food fund for households awaiting benefits</li>
  <li>Partner with faith communities for weekend provision coverage</li>
  <li>Integrate food referrals into GP appointments for identified risk cohorts</li>
</ul>
<br><em>Estimated 1,240 additional households would be reached with these measures.</em>`,
      suggestionsAfter: [
        'What is the funding available for food programmes?',
        'Show food insecurity by age group',
        'Generate social programme report'
      ]
    };
  }

  return {
    text: `<strong>🤖 Copilot for Health Analytics</strong><br><br>
I have access to real-time data across all 5 districts including disease surveillance, population health metrics, and social services caseloads.<br><br>
<strong>I can help you with:</strong>
<ul>
  <li>📊 Disease outbreak analysis and forecasting</li>
  <li>💉 Vaccine coverage gap identification</li>
  <li>🏥 Hospital capacity planning</li>
  <li>👥 Social services case prioritisation</li>
  <li>💰 Cost avoidance and ROI analysis</li>
  <li>📋 Executive briefing generation</li>
</ul>
<br>Try asking about a specific district, disease, or programme area.`,
    suggestionsAfter: [
      'What are the most urgent issues today?',
      'Show me the Eastern District situation',
      'Generate executive briefing'
    ]
  };
}
