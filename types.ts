export interface ProjectInputs {
  projectName: string;
  companyLogo: string; // New: Logo URL
  
  // Areas & Dimensions
  landArea: number; // Metrazh Zamin
  parkingOccupancyPercentage: number; // New: Satah Eshghal Parking/Paye (e.g. 80%)
  residentialOccupancyPercentage: number; // New: Satah Eshghal Borj/Maskooni (e.g. 40%)
  
  grossTotalArea: number; // Zirbana Kol (Nakhales)
  totalArea: number; // Net Residential (Khales Mofid)
  commercialArea: number; 
  
  // Structure
  floors: number;
  blocks: number;
  constructionType: string;
  facade: string;
  
  // Timing & Costs
  durationMonths: number;
  elapsedMonths: number; // New: Months passed since start
  constructionCostPerMeter: number;
  baseConstructionCost: number; // Hazine Payeh
  
  // Sales
  unitShareSize: number;
  unitSharePrice: number; // Total price for 10m share (e.g. 650,000,000)
  secondPaymentDate: string; // New: Date for the 2nd 50% payment
  additionalFee: number;
  
  // Scenarios & Quality
  constructionQuality: 'Standard' | 'Luxury' | 'SuperLuxury'; 
  pessimisticGrowth: number; // %
  optimisticGrowth: number; // %
  
  // Descriptions
  location: string;
  access: string;
  projectDescription: string; 
  architectureStyle: string; 
  commonAmenities: string; 
  builderResume: string; 
}

export interface ProposalContent {
  executiveSummary: string;
  locationAnalysis: string;
  financialOutlook: string;
  architecturalVision: string;
  riskAssessment: string;
}

export enum ViewMode {
  DASHBOARD = 'DASHBOARD',
  PROPOSAL = 'PROPOSAL'
}