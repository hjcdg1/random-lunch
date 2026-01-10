import type { EdgeWeightMap, Group, SAParams, SAResult } from '../shared/types';
import { SA_PARAMS } from '../shared/constants';
import { createInitialGroups, copyGroups, validateGroupSizes } from './grouping';
import { calculateTotalCost } from './costFunction';

/**
 * Run Simulated Annealing to find optimal group assignment
 * Minimizes the sum of edge weights across all groups
 */
export function runSimulatedAnnealing(
  memberIds: number[],
  edgeWeights: EdgeWeightMap,
  params: SAParams = SA_PARAMS
): SAResult {
  // Initialize with random grouping
  let currentSolution = createInitialGroups(memberIds);
  let currentCost = calculateTotalCost(currentSolution, edgeWeights);

  // Track best solution found
  let bestSolution = copyGroups(currentSolution);
  let bestCost = currentCost;

  // Simulated Annealing parameters
  let temperature = params.initialTemp;
  const { coolingRate, minTemp, maxItersPerTemp } = params;

  let iteration = 0;
  const startTime = Date.now();

  // Main SA loop
  while (temperature > minTemp) {
    for (let i = 0; i < maxItersPerTemp; i++) {
      iteration++;

      // Generate neighbor solution
      const neighbor = generateNeighbor(currentSolution);

      // Skip if neighbor is invalid
      if (!validateGroupSizes(neighbor)) {
        continue;
      }

      const neighborCost = calculateTotalCost(neighbor, edgeWeights);
      const delta = neighborCost - currentCost;

      // Accept or reject neighbor
      if (delta < 0) {
        // Better solution - always accept
        currentSolution = neighbor;
        currentCost = neighborCost;

        // Update best if necessary
        if (currentCost < bestCost) {
          bestSolution = copyGroups(currentSolution);
          bestCost = currentCost;
        }
      } else {
        // Worse solution - accept with probability exp(-delta / T)
        const acceptanceProbability = Math.exp(-delta / temperature);
        if (Math.random() < acceptanceProbability) {
          currentSolution = neighbor;
          currentCost = neighborCost;
        }
      }
    }

    // Cool down
    temperature *= coolingRate;

    // Log progress every 100 iterations
    if (iteration % 100 === 0) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(
        `SA iteration ${iteration}: T=${temperature.toFixed(4)}, ` +
          `current=${currentCost}, best=${bestCost}, elapsed=${elapsed}s`
      );
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`SA completed: ${iteration} iterations, best cost=${bestCost}, time=${totalTime}s`);

  return {
    groups: bestSolution,
    cost: bestCost,
  };
}

/**
 * Generate a neighbor solution by swapping members between two random groups
 */
function generateNeighbor(groups: Group[]): Group[] {
  const neighbor = copyGroups(groups);

  if (neighbor.length < 2) {
    return neighbor; // Can't swap if less than 2 groups
  }

  // Select two random groups
  const idx1 = Math.floor(Math.random() * neighbor.length);
  let idx2 = Math.floor(Math.random() * neighbor.length);
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * neighbor.length);
  }

  const group1 = neighbor[idx1];
  const group2 = neighbor[idx2];

  if (group1.members.length === 0 || group2.members.length === 0) {
    return neighbor; // Can't swap if a group is empty
  }

  // Select random members from each group
  const member1Idx = Math.floor(Math.random() * group1.members.length);
  const member2Idx = Math.floor(Math.random() * group2.members.length);

  // Swap the members
  const temp = group1.members[member1Idx];
  group1.members[member1Idx] = group2.members[member2Idx];
  group2.members[member2Idx] = temp;

  return neighbor;
}

/**
 * Alternative neighbor generation: move one member to a different group
 * Currently unused, but kept for future use
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateNeighborByMove(groups: Group[]): Group[] {
  const neighbor = copyGroups(groups);

  if (neighbor.length < 2) {
    return neighbor;
  }

  // Select a random group to take a member from
  const fromIdx = Math.floor(Math.random() * neighbor.length);
  if (neighbor[fromIdx].members.length === 0) {
    return neighbor;
  }

  // Select a random group to move the member to
  let toIdx = Math.floor(Math.random() * neighbor.length);
  while (toIdx === fromIdx) {
    toIdx = Math.floor(Math.random() * neighbor.length);
  }

  // Move a random member
  const memberIdx = Math.floor(Math.random() * neighbor[fromIdx].members.length);
  const member = neighbor[fromIdx].members.splice(memberIdx, 1)[0];
  neighbor[toIdx].members.push(member);

  return neighbor;
}

/**
 * Run multiple SA attempts and return the best result
 * This can improve solution quality at the cost of more time
 */
export function runMultipleAttempts(
  memberIds: number[],
  edgeWeights: EdgeWeightMap,
  attempts = 3,
  params: SAParams = SA_PARAMS
): SAResult {
  let bestResult: SAResult | null = null;

  for (let i = 0; i < attempts; i++) {
    console.log(`\n=== SA Attempt ${i + 1}/${attempts} ===`);
    const result = runSimulatedAnnealing(memberIds, edgeWeights, params);

    if (!bestResult || result.cost < bestResult.cost) {
      bestResult = result;
    }
  }

  if (!bestResult) {
    throw new Error('No result found after multiple attempts');
  }
  return bestResult;
}
