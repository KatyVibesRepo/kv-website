import type { MenuSection as MenuSectionType } from '@/lib/siteContent';

function estimateMenuSectionWeight(section: MenuSectionType) {
  const headerWeight = 2.25 + (section.kicker ? 0.85 : 0);

  const itemWeight = section.items.reduce((total, item) => {
    const descriptionWeight = item.description
      ? Math.min(1.2, item.description.length / 135)
      : 0;
    const badgeWeight = item.badge ? 0.2 : 0;
    const priceWeight = item.price ? 0.1 : 0;

    return total + 1 + descriptionWeight + badgeWeight + priceWeight;
  }, 0);

  return headerWeight + itemWeight;
}

function getColumnWeight(column: MenuSectionType[]) {
  return column.reduce((total, section) => total + estimateMenuSectionWeight(section), 0);
}

function scoreColumns(columns: MenuSectionType[][]) {
  const weights = columns.map(getColumnWeight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const targetWeight = totalWeight / Math.max(1, weights.length);
  const tallest = Math.max(...weights);
  const shortest = Math.min(...weights);
  const targetDistance = weights.reduce((sum, weight) => sum + Math.abs(weight - targetWeight), 0);

  const counts = columns.map((column) => column.length);
  const totalSections = counts.reduce((sum, count) => sum + count, 0);
  const targetCount = totalSections / Math.max(1, counts.length);
  const countDistance = counts.reduce((sum, count) => sum + Math.abs(count - targetCount), 0);
  const countSpread = Math.max(...counts) - Math.min(...counts);

  const middleIndex = Math.floor(counts.length / 2);
  const remainder = totalSections % Math.max(1, counts.length);
  const extraSectionCount = Math.ceil(targetCount);

  // When the menu has exactly one leftover section after an even column split,
  // make the middle column the column that receives the extra card. This keeps
  // the page from feeling left-heavy while still letting the weight balancer
  // choose the cleanest split inside that preference.
  const singleRemainderMiddlePenalty =
    remainder === 1 && counts.length >= 3 && counts[middleIndex] !== extraSectionCount
      ? 500
      : 0;

  // Primary goal: keep the section count visually even. Secondary goal: avoid
  // one visibly short/tall column. Tertiary goal: keep all columns near target
  // weight while preserving the original menu order.
  return countSpread * 1000 + countDistance * 100 + singleRemainderMiddlePenalty + (tallest - shortest) * 10 + targetDistance;
}

export function balanceMenuSectionsIntoColumns(
  sections: MenuSectionType[],
  columnCount = 3,
) {
  if (columnCount <= 1 || sections.length <= 1) {
    return [sections];
  }

  if (sections.length <= columnCount) {
    return Array.from({ length: columnCount }, (_, index) => (
      sections[index] ? [sections[index]] : []
    ));
  }

  let bestColumns: MenuSectionType[][] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  function search(startIndex: number, remainingColumns: number, currentColumns: MenuSectionType[][]) {
    if (remainingColumns === 1) {
      const candidate = [...currentColumns, sections.slice(startIndex)];
      const candidateScore = scoreColumns(candidate);

      if (candidateScore < bestScore) {
        bestScore = candidateScore;
        bestColumns = candidate;
      }

      return;
    }

    const lastPossibleEnd = sections.length - remainingColumns + 1;

    for (let endIndex = startIndex + 1; endIndex <= lastPossibleEnd; endIndex += 1) {
      search(
        endIndex,
        remainingColumns - 1,
        [...currentColumns, sections.slice(startIndex, endIndex)],
      );
    }
  }

  search(0, columnCount, []);

  return bestColumns || [sections];
}
