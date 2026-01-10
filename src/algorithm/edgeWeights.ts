import type { EdgeWeightMap, Group } from '../shared/types';

/**
 * Get a consistent edge key for two members
 * Always returns in format "smaller_id-larger_id"
 */
export function getEdgeKey(memberA: number, memberB: number): string {
  const [smaller, larger] = memberA < memberB ? [memberA, memberB] : [memberB, memberA];
  return `${smaller}-${larger}`;
}

/**
 * Get the weight of an edge between two members
 */
export function getEdgeWeight(weights: EdgeWeightMap, memberA: number, memberB: number): number {
  const key = getEdgeKey(memberA, memberB);
  return weights[key] || 0;
}

/**
 * Update edge weights based on new group assignments
 * Returns the updated weights and a list of updates made
 */
export function updateEdgeWeights(
  currentWeights: EdgeWeightMap,
  groups: Group[]
): { updated: EdgeWeightMap; updates: Array<{ pair: string; incrementBy: number }> } {
  const updated = { ...currentWeights };
  const updates: Array<{ pair: string; incrementBy: number }> = [];

  groups.forEach(group => {
    const members = group.members;
    // For each pair in the group, increment the edge weight
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const key = getEdgeKey(members[i], members[j]);
        updated[key] = (updated[key] || 0) + 1;
        updates.push({ pair: key, incrementBy: 1 });
      }
    }
  });

  return { updated, updates };
}

/**
 * Get all edges for a set of members
 */
export function getAllEdges(memberIds: number[]): string[] {
  const edges: string[] = [];
  for (let i = 0; i < memberIds.length; i++) {
    for (let j = i + 1; j < memberIds.length; j++) {
      edges.push(getEdgeKey(memberIds[i], memberIds[j]));
    }
  }
  return edges;
}
