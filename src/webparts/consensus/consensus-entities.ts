export interface ISPVendorsList {
  value: ISPVendor[];
}

export interface ISPVendor {
  ID: number;
  Title: string;
  IsShortListed: string;
  Alias: string;
  ContactPerson: string;
  ContactEmail: string;
}

export interface ISPRequirementList {
    value: ISPRequirement[];
  }
 
export interface ISPRequirement {
    ID: number;
    Title: string;
    RequirementNumber: string;
    Parent: string;
    Description: string;
    IsBundle: boolean;
  }

export interface ISPScores {
  ID: number;
  VendorID: number;
  RequirementNumber: string;
  Score: number;
  ScoreType: string;
  CommentText: string;
  EnteredBy: object;
  EnteredById: string;
  ConsensusScore: number;
  ConsensusComment: string;
  WeightedScore: number;
}

export interface ISPScoresList {
  value: ISPScores[];
}

export interface ISPScoreWeightings {
  ID: number;
  RequirementNumber: string;
  ScoreWeight: number;
}

export interface ISPScoreWeightingsList {
  value: ISPScoreWeightings[];
}

export enum ScoreType {
  EP = "EP",
  Consensus = "Consensus"
}
  
