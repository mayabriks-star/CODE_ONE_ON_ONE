export const cityOverview = {
  status: 'Moderate',
  riskLevel: 'MODERATE' as const,
  seaLevel: '+8 mm',
  seaLevelPeriod: '(24h)',
  waveActivity: '1.2m',
  waveStatus: 'Moderate',
  vulnerableDistricts: '12',
  totalDistricts: '28',
  tideStatus: 'Incoming',
  tideTime: 'Hight in 2h 18m',
  description:
    'Sea conditions are stable with moderate risk along the coastline. Protection systems are operational and effective.',
};

export const summaryStats = {
  riskLevel: 'MODERATE',
  affectedDistricts: 12,
  totalDistricts: 28,
  districtsChange: '2 since last week',
  populationAtRisk: '128,000',
  populationPercent: '18% of total',
  activeAlerts: 3,
};

export const alertOverview = {
  seaLevelRise: '+0.20',
  firstImpact: '18-24',
  withAction: '5-7',
};

export const strategy = {
  title: 'Comprehensive Protection & Adaptation',
  description:
    'Deploy immediate protective infrastructure while implementing long-term adaptation measures. Combines hard engineering solutions with community resilience programs.',
  timeline: '18–60 months',
  investment: '$70M',
  riskReduction: '85%',
  impactDelay: '5–7 years',
  components: [
    'Sea wall reinforcement in Harbor District',
    'Enhanced drainage and pump systems',
    'Elevated road infrastructure in high-risk zones',
    'Community relocation assistance program',
    'Building code updates for coastal zones',
  ],
};

export const districts = [
  { name: 'Harbor District', risk: 'High Risk', note: 'Immediate attention required', color: 'red' as const },
  { name: 'North Shore', risk: 'Medium', note: 'Assessment needed', color: 'orange' as const },
  { name: 'Riverfront', risk: 'Medium', note: 'Monitor closely', color: 'orange' as const },
  { name: 'Bayview', risk: 'Low', note: 'Routine monitoring', color: 'blue' as const },
];

export const budget = {
  total: '$70M',
  protectionLabel: 'Protection Measures',
  protectionAmount: '$28M',
  adaptationLabel: 'Adaptation Measures',
  adaptationAmount: '$42M',
  protectionPercent: 40,
  adaptationPercent: 60,
};

export const affectionsInfrastructure = [
  { name: 'Harbor Boulevard & Marine Drive', detail: '4.2 km' },
  { name: 'Storm water system (Zone 1-3)', detail: '18 outlets' },
  { name: 'Coastal substations A & B', detail: '2 facilities' },
  { name: 'Fire Station 12 access route', detail: 'Critical' },
  { name: 'Marina District water treatment', detail: '1 plant' },
];

export const affectionsPopulation = [
  { name: 'Harbor District residents', detail: '~8,400' },
  { name: 'North Shore residential area', detail: '~5,200' },
  { name: 'Seniors (65+ years) in flood zone', detail: '~2,800' },
  { name: 'Assisted living facilities', detail: '3 sites' },
  { name: 'Low-income housing units', detail: '~1,200' },
];
