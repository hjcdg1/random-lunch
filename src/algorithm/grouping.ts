import type { Group } from '../shared/types';
import { MIN_GROUP_SIZE, MAX_GROUP_SIZE, DEFAULT_GROUP_SIZE } from '../shared/constants';

/**
 * Create initial random groups from a list of member IDs
 * Attempts to make groups of target size (default 4), with sizes 3-5 allowed
 */
export function createInitialGroups(
  memberIds: number[],
  targetSize: number = DEFAULT_GROUP_SIZE
): Group[] {
  // Shuffle member IDs randomly
  const shuffled = [...memberIds].sort(() => Math.random() - 0.5);
  const groups: Group[] = [];
  const totalMembers = shuffled.length;

  // Calculate how many groups we need
  const idealGroupCount = Math.floor(totalMembers / targetSize);
  const remainder = totalMembers % targetSize;

  let idx = 0;

  if (remainder === 0) {
    // Perfect division: all groups of target size
    for (let i = 0; i < idealGroupCount; i++) {
      groups.push({ members: shuffled.slice(idx, idx + targetSize) });
      idx += targetSize;
    }
  } else if (remainder === 1) {
    // 1 extra person: make one group of size 5
    for (let i = 0; i < idealGroupCount - 1; i++) {
      groups.push({ members: shuffled.slice(idx, idx + targetSize) });
      idx += targetSize;
    }
    groups.push({ members: shuffled.slice(idx) }); // Size 5
  } else if (remainder === 2) {
    // 2 extra people: make two groups of size 3
    for (let i = 0; i < idealGroupCount - 1; i++) {
      groups.push({ members: shuffled.slice(idx, idx + targetSize) });
      idx += targetSize;
    }
    // Split remaining into two groups of 3
    const remaining = shuffled.slice(idx);
    const mid = Math.ceil(remaining.length / 2);
    groups.push({ members: remaining.slice(0, mid) });
    groups.push({ members: remaining.slice(mid) });
  } else if (remainder === 3) {
    // 3 extra people: make one group of size 3
    for (let i = 0; i < idealGroupCount; i++) {
      groups.push({ members: shuffled.slice(idx, idx + targetSize) });
      idx += targetSize;
    }
    groups.push({ members: shuffled.slice(idx) }); // Size 3
  }

  return groups;
}

/**
 * Validate that all group sizes are within acceptable range
 */
export function validateGroupSizes(groups: Group[]): boolean {
  return groups.every(group => {
    const size = group.members.length;
    return size >= MIN_GROUP_SIZE && size <= MAX_GROUP_SIZE;
  });
}

/**
 * Validate that all members appear exactly once across all groups
 */
export function validateGroupAssignment(groups: Group[], expectedMembers: number[]): boolean {
  const allAssignedMembers = new Set<number>();

  for (const group of groups) {
    for (const member of group.members) {
      if (allAssignedMembers.has(member)) {
        console.error(`Member ${member} appears in multiple groups`);
        return false;
      }
      allAssignedMembers.add(member);
    }
  }

  const expectedSet = new Set(expectedMembers);
  if (allAssignedMembers.size !== expectedSet.size) {
    console.error('Number of assigned members does not match expected');
    return false;
  }

  for (const member of expectedMembers) {
    if (!allAssignedMembers.has(member)) {
      console.error(`Member ${member} is missing from assignment`);
      return false;
    }
  }

  return true;
}

/**
 * Deep copy groups
 */
export function copyGroups(groups: Group[]): Group[] {
  return groups.map(group => ({
    members: [...group.members],
  }));
}
