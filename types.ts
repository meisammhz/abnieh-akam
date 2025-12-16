export interface ConstructionPhase {
  id: number;
  name: string;
  durationMonths: number;
  costPerMeter: number;
}

export interface UnitMix {
  size: string;
  percentage: number;
}

export interface Installment {
  id: number;
  name: string;
  amount: number;
  dueMonth: number;
}

export interface ProjectInputs {
  projectName: string;
  companyLogo: string;
  facadeImage: string;
  
  // Areas & Dimensions
  landArea: number;
  parkingOccupancyPercentage: number;
  residentialOccupancyPercentage: number;
  
  grossTotalArea: number;
  netResidentialArea: number;
  netCommercialArea: number; 
  
  // Structure
  floors: number;
  undergroundFloors: number;
  blocks: number;
  constructionType: 'Steel' | 'Concrete' | 'TunnelForm';
  landCondition: 'Normal' | 'Sloped' | 'Complex';
  facade: string;
  
  // Timing & Costs
  elapsedMonths: number;
  constructionPhases: ConstructionPhase[];
  
  // Sales
  unitShareSize: number;
  unitSharePrice: number; // Note: This might become redundant with installments
  installments: Installment[];
  secondPaymentDate: string;
  additionalFee: number;
  unitMix: UnitMix[]; 
  
  // Scenarios & Quality
  constructionQuality: 'Standard' | 'Luxury' | 'SuperLuxury'; 
  pessimisticMarketGrowth: number;
  optimisticMarketGrowth: number;
  constructionCostEscalation: number;
  
  // Overheads
  adminOverheadPercentage: number;
  salesCommissionPercentage: number;

  // Market & Strategic Analysis
  marketPricePerMeter: number;
  projectVibe: string; 
  locationAdvantages: string; 

  // Descriptions
  location: string;
  access: string;
  projectDescription: string; 
  architectureStyle: string; 
  commonAmenities: string; 
  builderResume: string; 
  constructionDescription: string;
  facadeDescription: string;
  coreShellDescription: string;

  // Technical Details
  foundationSystem: string;
  roofSystem: string;
  interiorFinishes: string;
  hvacSystem: string;
  electricalSystem: string;
}

export interface ProposalContent {
  executiveSummary: string;
  architecturalDeepDive: string;
  locationAndAccessAnalysis: string;
  financialModelAndProfitability: string;
  investorValueProposition: string;
  riskAndMitigation: string;
  conceptualImage: string; 
  conceptualImagePrompt: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  PROPOSAL = 'PROPOSAL'
}