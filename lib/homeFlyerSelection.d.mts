export type HomeFlyerCandidate = {
  imageUrl: string;
  width: number;
  height: number;
};

export type HomeFlyerSelection = {
  imageUrl: string;
  frame: 'nine-sixteen' | 'five-six';
};

export function isNineBySixteenFlyer(width: number, height: number): boolean;

export function selectHomeFlyer(
  candidates: HomeFlyerCandidate[],
): HomeFlyerSelection | null;
