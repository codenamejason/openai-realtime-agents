export type Bounty = {
  name: string;
  description: string;
  trackId: string;
};

export type BountyResult = {
  isValid: boolean;
  errors: string[];
  bounties: Bounty[];
};
