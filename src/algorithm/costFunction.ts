import type { EdgeWeightMap, Group } from '../shared/types';
import { getEdgeWeight } from './edgeWeights';

/**
 * Calculate the cost of a single group
 * Cost is the sum of all edge weights within the group
 */
export function calculateGroupCost(group: Group, weights: EdgeWeightMap): number {
  let cost = 0;
  const members = group.members;

  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      cost += getEdgeWeight(weights, members[i], members[j]);
    }
  }

  return cost;
}

/**
 * Calculate the total cost of all groups
 * Lower cost is better (fewer repeated pairings)
 */
export function calculateTotalCost(groups: Group[], weights: EdgeWeightMap): number {
  return groups.reduce((total, group) => total + calculateGroupCost(group, weights), 0);
}

/**
 * Calculate size penalty for groups that deviate from target size
 * This is optional and can be used to prefer more balanced group sizes
 */
export function calculateSizePenalty(groups: Group[], targetSize = 4): number {
  return groups.reduce((penalty, group) => {
    const size = group.members.length;
    // No penalty for sizes 3, 4, or 5
    if (size >= 3 && size <= 5) {
      return penalty;
    }
    // Heavy penalty for sizes outside the acceptable range
    return penalty + Math.abs(size - targetSize) * 100;
  }, 0);
}

/**
 * Calculate combined cost including size penalty
 */
export function calculateCombinedCost(
  groups: Group[],
  weights: EdgeWeightMap,
  targetSize = 4,
  sizePenaltyWeight = 0.1
): number {
  const edgeCost = calculateTotalCost(groups, weights);
  const sizePenalty = calculateSizePenalty(groups, targetSize);
  return edgeCost + sizePenalty * sizePenaltyWeight;
}
