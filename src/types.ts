export interface Placement {
  placementPercentage: string;
  averagePackage: string;
  medianPackage: string;
  highestPackage: string;
}

export interface CollegeData {
  institute: string;
  program: string;
  fullProgram: string;
  quota: string;
  seatType: string;
  gender: string;
  openingRank: number | string;
  closingRank: number;
  placement: Placement;
}
export interface UserInput {
  counseling: string;
  round: string;
  rank: number;
  category: string;
  gender: string;
  quota: string;
  preferredBranch: string;
  instituteTypes: string[];
  homeState: string;
}
