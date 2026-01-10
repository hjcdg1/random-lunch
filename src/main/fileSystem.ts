import { app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import type { Assignment, AssignmentFile, EdgeWeightMap, Settings } from '../shared/types';

// Directory paths
const getUserDataPath = () => app.getPath('userData');
const getDataDir = () => path.join(getUserDataPath(), 'data');
const getAssignmentsDir = () => path.join(getDataDir(), 'assignments');
const getEdgeWeightsPath = () => path.join(getDataDir(), 'edge-weights.json');
const getSettingsPath = () => path.join(getDataDir(), 'settings.json');

// Initialize data directories
export async function initializeDataDirs(): Promise<void> {
  const dataDir = getDataDir();
  const assignmentsDir = getAssignmentsDir();

  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(assignmentsDir, { recursive: true });
  } catch (error) {
    console.error('Failed to create data directories:', error);
    throw error;
  }
}

// Assignment operations

export async function loadAssignments(): Promise<Assignment[]> {
  await initializeDataDirs();
  const assignmentsDir = getAssignmentsDir();

  try {
    const files = await fs.readdir(assignmentsDir);
    const assignmentFiles = files.filter(f => f.startsWith('assignment-') && f.endsWith('.json'));

    const assignments: Assignment[] = [];

    for (const file of assignmentFiles) {
      const filePath = path.join(assignmentsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const data: AssignmentFile = JSON.parse(content);

      assignments.push({
        timestamp: data.timestamp,
        groups: data.groups,
        participatingMembers: data.participatingMembers,
      });
    }

    // Sort by timestamp descending (most recent first)
    assignments.sort((a, b) => b.timestamp - a.timestamp);

    return assignments;
  } catch (error) {
    console.error('Failed to load assignments:', error);
    return [];
  }
}

export async function loadAssignment(timestamp: number): Promise<AssignmentFile> {
  const assignmentsDir = getAssignmentsDir();
  const fileName = `assignment-${timestamp}.json`;
  const filePath = path.join(assignmentsDir, fileName);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to load assignment ${timestamp}:`, error);
    throw error;
  }
}

export async function saveAssignment(
  assignment: Assignment,
  edgeUpdates: Array<{ pair: string; incrementBy: number }>
): Promise<void> {
  await initializeDataDirs();
  const assignmentsDir = getAssignmentsDir();
  const fileName = `assignment-${assignment.timestamp}.json`;
  const filePath = path.join(assignmentsDir, fileName);

  const data: AssignmentFile = {
    timestamp: assignment.timestamp,
    groups: assignment.groups,
    participatingMembers: assignment.participatingMembers,
    edgeUpdates,
  };

  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save assignment:', error);
    throw error;
  }
}

// Edge weights operations

export async function loadEdgeWeights(): Promise<EdgeWeightMap> {
  await initializeDataDirs();
  const filePath = getEdgeWeightsPath();

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist yet, return empty map
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {};
    }
    console.error('Failed to load edge weights:', error);
    throw error;
  }
}

export async function saveEdgeWeights(weights: EdgeWeightMap): Promise<void> {
  await initializeDataDirs();
  const filePath = getEdgeWeightsPath();

  try {
    await fs.writeFile(filePath, JSON.stringify(weights, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save edge weights:', error);
    throw error;
  }
}

// Settings operations

export async function loadSettings(): Promise<Settings> {
  await initializeDataDirs();
  const filePath = getSettingsPath();

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    // File doesn't exist yet, return defaults
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        theme: 'system',
        apiToken: '',
      };
    }
    console.error('Failed to load settings:', error);
    throw error;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await initializeDataDirs();
  const filePath = getSettingsPath();

  try {
    await fs.writeFile(filePath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw error;
  }
}

export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  const current = await loadSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return updated;
}

// Delete assignment

export async function deleteAssignment(timestamp: number): Promise<void> {
  const assignmentsDir = getAssignmentsDir();
  const fileName = `assignment-${timestamp}.json`;
  const filePath = path.join(assignmentsDir, fileName);

  try {
    await fs.unlink(filePath);
    console.log(`Deleted assignment: ${fileName}`);
  } catch (error) {
    console.error(`Failed to delete assignment ${timestamp}:`, error);
    throw error;
  }
}
