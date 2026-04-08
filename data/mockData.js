const mockData = {
  kpis: {
    citizensMonitored: 2400000,
    activeAlerts: 7,
    earlierDetection: 76,
    manualTriageReduction: 71,
    fasterReporting: 8
  },

  populationTrends: {
    labels: ['May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr'],
    highRisk: [41200,42800,44100,45300,43900,42100,43500,44800,46200,47100,47800,48200],
    activePrograms: [18400,19200,20100,21300,22000,22800,23400,24100,24800,25300,25900,26400],
    vaccinationCoverage: [71,72,73,73,74,74,75,76,76,77,77,78]
  },

  riskStratification: {
    veryHigh: 8200,
    high: 39623,
    moderate: 214000,
    low: 680000,
    healthy: 1458177
  },

  chronicDisease: {
    districts: ['Northern','Eastern','Southern','Western','Central'],
    diabetes:    [14.2, 18.7, 12.1, 15.9, 11.3],
    hypertension:[28.4, 32.1, 24.6, 29.8, 22.7],
    obesity:     [31.2, 35.8, 27.4, 33.1, 25.9],
    mentalHealth:[12.8, 14.2, 10.9, 13.4,  9.8]
  },

  sdohCoverage: [
    { label: 'Housing Assistance', value: 67, color: '#0078D4' },
    { label: 'Food Security Programs', value: 54, color: '#00B4D8' },
    { label: 'Mental Health Services', value: 48, color: '#5C2D91' },
    { label: 'Employment Support', value: 61, color: '#107C10' },
    { label: 'Transportation Access', value: 43, color: '#FF8C00' },
    { label: 'Childcare Assistance', value: 38, color: '#D13438' }
  ],

  interventions: [
    {
      id: 'INT-001',
      priority: 'high',
      title: 'Emergency Vaccination Drive — Rural Zone B',
      description: 'Deploy mobile vaccination units to address critical coverage gap of 32% below target threshold in Rural Zone B. Current coverage at 68%, target 85%.',
      impact: '+17% coverage · 4,200 residents',
      status: 'pending',
      notifyList: ['District Health Officer', 'Vaccination Team Lead', 'Community Liaison'],
      timeline: '72 hours deployment · 2-week campaign',
      resources: '3 mobile units, 12 staff, 5,000 doses'
    },
    {
      id: 'INT-002',
      priority: 'medium',
      title: 'Enhanced Respiratory Surveillance — Eastern District',
      description: 'Increase testing frequency and contact tracing capacity to manage +34% week-over-week rise in respiratory illness cases in the Eastern District.',
      impact: 'Reduce spread · Est. 850 cases averted',
      status: 'in_review',
      notifyList: ['Epidemiology Team', 'Eastern District Director', 'Lab Services'],
      timeline: 'Immediate activation · 3-week protocol',
      resources: '2 contact trace teams, 500 test kits/day'
    },
    {
      id: 'INT-003',
      priority: 'low',
      title: 'SDOH Outreach Expansion — High-Risk Cohort',
      description: 'Extend social determinants of health screening and referral services to 2,400 newly identified high-risk individuals identified through AI risk stratification.',
      impact: '+2,400 individuals reached',
      status: 'approved',
      notifyList: ['Social Services Director', 'Casework Supervisor', 'Community Partners'],
      timeline: '30-day rollout',
      resources: '6 caseworkers, community partner network'
    }
  ],

  outbreaks: [
    {
      id: 'OB-001',
      disease: 'Influenza A (H3N2)',
      district: 'Eastern',
      cases7d: 847,
      trend: 'up',
      trendPct: 34,
      status: 'critical',
      trajectory30d: [420,455,492,521,558,601,649,702,758,820,847,890,940,985,1030,1060,1100,1130,1150,1170,1180,1190,1195,1200,1205,1200,1195,1185,1170,1155]
    },
    {
      id: 'OB-002',
      disease: 'RSV (Respiratory Syncytial)',
      district: 'Northern',
      cases7d: 312,
      trend: 'up',
      trendPct: 18,
      status: 'elevated',
      trajectory30d: [210,218,225,234,244,254,265,276,288,300,312,320,328,334,339,342,344,345,344,342,339,335,330,324,317,310,302,295,288,282]
    },
    {
      id: 'OB-003',
      disease: 'Norovirus',
      district: 'Central',
      cases7d: 156,
      trend: 'flat',
      trendPct: 2,
      status: 'monitoring',
      trajectory30d: [140,142,145,148,152,155,158,160,159,157,156,155,154,153,152,151,150,150,149,148,147,146,145,144,143,142,141,140,139,138]
    },
    {
      id: 'OB-004',
      disease: 'Hepatitis A',
      district: 'Southern',
      cases7d: 28,
      trend: 'down',
      trendPct: 12,
      status: 'improving',
      trajectory30d: [48,46,44,42,40,38,37,36,35,34,33,32,31,31,30,30,29,29,28,28,27,27,26,26,25,25,24,24,23,23]
    },
    {
      id: 'OB-005',
      disease: 'SARS-CoV-2 (Wastewater Signal)',
      district: 'Sector 4',
      cases7d: 94,
      trend: 'up',
      trendPct: 22,
      status: 'elevated',
      trajectory30d: [55,58,61,65,70,75,80,84,88,91,94,98,103,108,112,116,119,121,122,122,121,119,116,112,108,103,98,93,88,83]
    }
  ],

  surveillanceTimeSeries: {
    labels: ['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8','Wk9','Wk10','Wk11','Wk12','Wk13','Wk14','Wk15','Wk16'],
    ili:          [120,135,142,158,172,189,210,235,265,290,318,342,368,390,415,447],
    respiratory:  [88, 96,103,115,128,141,158,172,191,210,232,248,268,285,304,326],
    wastewater:   [2.1,2.3,2.4,2.7,3.0,3.4,3.8,4.2,4.7,5.1,5.6,6.0,6.5,6.9,7.4,8.1],
    baseline:     [200,200,200,200,200,200,200,200,200,200,200,200,200,200,200,200]
  },

  mapHotspots: [
    { id: 'HS-001', label: 'Eastern District Hub', x: 68, y: 35, type: 'critical', district: 'Eastern', riskLevel: 'Critical', activeCases: 847, description: 'Respiratory illness surge. Immediate intervention required.' },
    { id: 'HS-002', label: 'Rural Zone B', x: 22, y: 55, type: 'amber', district: 'Rural Zone B', riskLevel: 'High', activeCases: 312, description: 'Vaccine coverage below threshold at 68%.' },
    { id: 'HS-003', label: 'Sector 4 Wastewater', x: 45, y: 72, type: 'amber', district: 'Sector 4', riskLevel: 'Elevated', activeCases: 94, description: 'SARS-CoV-2 wastewater signal elevated 22% WoW.' },
    { id: 'HS-004', label: 'Northern District', x: 38, y: 20, type: 'amber', district: 'Northern', riskLevel: 'Elevated', activeCases: 312, description: 'RSV cases rising, paediatric wards approaching capacity.' },
    { id: 'HS-005', label: 'Central Community', x: 50, y: 48, type: 'blue', district: 'Central', riskLevel: 'Monitoring', activeCases: 156, description: 'Norovirus cluster — community centre outbreak contained.' }
  ],

  earlyWarningLog: [
    { id: 'EW-001', dot: 'red', title: 'ALERT: Respiratory surge threshold exceeded', meta: 'Eastern District · 2 hours ago', desc: 'ILI case rate crossed the 400/100k threshold. AI model confidence: 94%. Recommended: activate surge protocol.' },
    { id: 'EW-002', dot: 'amber', title: 'WARNING: Wastewater SARS-CoV-2 signal rising', meta: 'Sector 4 · 6 hours ago', desc: 'Wastewater viral load increased 22% week-over-week. Predictive model indicates potential clinical surge in 8-12 days.' },
    { id: 'EW-003', dot: 'amber', title: 'WARNING: Vaccine coverage gap detected', meta: 'Rural Zone B · 1 day ago', desc: 'Coverage dropped to 68% against 85% target. 4,200 unprotected residents identified in high-risk age cohorts.' },
    { id: 'EW-004', dot: 'blue', title: 'INFO: AI intervention plans generated', meta: 'System-wide · 2 days ago', desc: '3 evidence-based intervention plans generated and queued for clinical review. Estimated combined impact: 7,450 lives improved.' }
  ],

  socialCases: [
    { id: 'SC-001', icon: '🏠', title: 'Housing Crisis — Family of 4', meta: 'Referred: 3 days ago · Eastern District', riskScore: 92, district: 'Eastern', notes: 'Family facing eviction. Two children under 5. Father recently lost employment. Requires emergency housing placement within 48 hours.', history: [
      { date: '2026-04-06', action: 'Initial assessment completed', by: 'J. Martinez' },
      { date: '2026-04-07', action: 'Housing application submitted', by: 'J. Martinez' },
      { date: '2026-04-07', action: 'Emergency food assistance arranged', by: 'K. Thompson' },
      { date: '2026-04-08', action: 'Follow-up call scheduled', by: 'System' }
    ]},
    { id: 'SC-002', icon: '🧠', title: 'Mental Health Crisis — Adult Male', meta: 'Referred: 1 day ago · Northern District', riskScore: 88, district: 'Northern', notes: 'Client presents with severe anxiety and depression following job loss. Homeless for 2 weeks. Requires mental health assessment and temporary shelter.', history: [
      { date: '2026-04-07', action: 'Crisis referral received', by: 'Hospital A&E' },
      { date: '2026-04-07', action: 'Risk assessment: HIGH', by: 'L. Chen' },
      { date: '2026-04-08', action: 'Assigned to mental health team', by: 'Supervisor' }
    ]},
    { id: 'SC-003', icon: '👴', title: 'Elderly Isolation — 78yo Female', meta: 'Referred: 5 days ago · Southern District', riskScore: 74, district: 'Southern', notes: 'Lives alone, mobility issues, no family support. At risk of falls and malnutrition. Regular welfare checks required.', history: [
      { date: '2026-04-03', action: 'Neighbour welfare referral', by: 'Community' },
      { date: '2026-04-04', action: 'Home visit completed', by: 'M. Patel' },
      { date: '2026-04-05', action: 'Meal delivery service arranged', by: 'M. Patel' },
      { date: '2026-04-06', action: 'Telehealth appointment booked', by: 'System' }
    ]},
    { id: 'SC-004', icon: '👶', title: 'Child Safeguarding — 3 children', meta: 'Referred: 2 days ago · Western District', riskScore: 85, district: 'Western', notes: 'Three children ages 4, 7, 9. Concerns about neglect and domestic instability. Requires urgent safeguarding assessment.', history: [
      { date: '2026-04-06', action: 'School safeguarding referral', by: 'School' },
      { date: '2026-04-07', action: 'Safeguarding officer assigned', by: 'Manager' },
      { date: '2026-04-07', action: 'Home visit pending', by: 'R. Davis' }
    ]},
    { id: 'SC-005', icon: '🍎', title: 'Food Insecurity — Single Parent', meta: 'Referred: 1 week ago · Central District', riskScore: 61, district: 'Central', notes: 'Single mother, 2 children, benefits delayed 6 weeks. Running out of food. Referred to food bank but needs longer-term benefits support.', history: [
      { date: '2026-04-01', action: 'Benefits delay reported', by: 'Client' },
      { date: '2026-04-02', action: 'Food bank referral issued', by: 'A. Wilson' },
      { date: '2026-04-04', action: 'Benefits appeal submitted', by: 'A. Wilson' },
      { date: '2026-04-07', action: 'Awaiting DWP response', by: 'System' }
    ]},
    { id: 'SC-006', icon: '💊', title: 'Substance Dependency Support', meta: 'Referred: 4 days ago · Northern District', riskScore: 79, district: 'Northern', notes: 'Client seeking help with opioid dependency. Currently sleeping rough. Needs immediate connection to treatment programme and safe accommodation.', history: [
      { date: '2026-04-04', action: 'Self-referral via helpline', by: 'Client' },
      { date: '2026-04-05', action: 'Initial intake completed', by: 'B. Okafor' },
      { date: '2026-04-06', action: 'Detox programme application', by: 'B. Okafor' },
      { date: '2026-04-07', action: 'Temporary shelter arranged', by: 'B. Okafor' }
    ]}
  ],

  workflowSteps: [
    { id: 'WF-001', icon: '📋', label: 'Initial Assessment', status: 'done' },
    { id: 'WF-002', icon: '🔍', label: 'Risk Screening', status: 'done' },
    { id: 'WF-003', icon: '📊', label: 'AI Risk Scoring', status: 'done' },
    { id: 'WF-004', icon: '👤', label: 'Caseworker Assignment', status: 'active' },
    { id: 'WF-005', icon: '🎯', label: 'Intervention Planning', status: 'pending' },
    { id: 'WF-006', icon: '✅', label: 'Outcome Review', status: 'pending' }
  ],

  programOutcomes: {
    housing: { value: 847, label: 'Housing placements', delta: '+12%', positive: true },
    benefits: { value: 2341, label: 'Benefits secured', delta: '+8%', positive: true },
    selfSufficiency: { value: 68, label: '% Self-sufficient at 6mo', delta: '+5pts', positive: true },
    repeatCrisis: { value: 14, label: '% Repeat crisis events', delta: '-3pts', positive: true }
  },

  caseworkerCapacity: {
    districts: ['Northern','Eastern','Southern','Western','Central'],
    assigned: [82, 94, 71, 88, 65],
    capacity: [100, 100, 100, 100, 100]
  },

  caseVolume: {
    labels: ['Nov','Dec','Jan','Feb','Mar','Apr'],
    programs: {
      'Housing': [142,158,171,183,196,210],
      'Mental Health': [98,104,112,119,128,134],
      'Benefits': [210,224,238,251,263,278],
      'Safeguarding': [67,71,74,78,82,87],
      'Substance': [44,48,52,55,59,63]
    }
  },

  copilotSuggestions: [
    'What are the top vaccine coverage gaps by district?',
    'Show me the highest risk social cases this week',
    'Generate executive briefing for today',
    'Forecast hospital capacity over next 30 days',
    'Analyse the respiratory surge in Eastern District',
    'What does the wastewater signal mean for Sector 4?',
    'Show 30-day disease trajectory forecast',
    'Calculate cost savings from early interventions',
    'Generate a full health analytics report',
    'What mental health trends should I be aware of?',
    'Identify food insecurity hotspots',
    'Which districts need priority resource allocation?'
  ]
};

export default mockData;
