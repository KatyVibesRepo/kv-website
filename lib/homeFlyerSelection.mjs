// Classify homepage flyers by their actual image dimensions, not their SHA-based URLs.
const NINE_BY_SIXTEEN = 9 / 16;
const FIVE_BY_SIX = 5 / 6;

export function isNineBySixteenFlyer(width, height) {
  return Number.isFinite(width)
    && Number.isFinite(height)
    && width > 0
    && height > 0
    && Math.abs(width / height - NINE_BY_SIXTEEN) <= 0.05;
}

export function selectHomeFlyer(candidates) {
  const valid = candidates.filter(
    (candidate) => candidate
      && typeof candidate.imageUrl === 'string'
      && candidate.imageUrl.length > 0
      && Number.isFinite(candidate.width)
      && Number.isFinite(candidate.height)
      && candidate.width > 0
      && candidate.height > 0
  );

  if (!valid.length) return null;

  const truePortrait = valid.find((candidate) =>
    isNineBySixteenFlyer(candidate.width, candidate.height)
  );

  if (truePortrait) {
    return { imageUrl: truePortrait.imageUrl, frame: 'nine-sixteen' };
  }

  // When KVRS has only the 1500x1800 (5:6) flyer, give it a 5:6 card,
  // rather than cropping it inside a forced 9:16 card.
  const bestFallback = valid.reduce((best, candidate) =>
    Math.abs(candidate.width / candidate.height - FIVE_BY_SIX)
      < Math.abs(best.width / best.height - FIVE_BY_SIX)
      ? candidate
      : best
  );

  return { imageUrl: bestFallback.imageUrl, frame: 'five-six' };
}
