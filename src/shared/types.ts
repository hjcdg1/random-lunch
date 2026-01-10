// Core domain types

export interface Member {
  id: number;
}

export interface Group {
  members: number[];
}

export interface Assignment {
  timestamp: number;
  groups: Group[];
  participatingMembers: number[];
}

export interface EdgeWeightMap {
  [key: string]: number; // "1-5": 2 (member 1과 5가 2번 만남)
}

export interface AssignmentFile {
  timestamp: number;
  groups: Group[];
  participatingMembers: number[];
  edgeUpdates: Array<{ pair: string; incrementBy: number }>;
}

// Settings types

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Settings {
  theme: ThemeMode;
  apiToken: string;
}

// Simulated Annealing types

export interface SAParams {
  initialTemp: number;
  coolingRate: number;
  minTemp: number;
  maxItersPerTemp: number;
}

export interface SAResult {
  groups: Group[];
  cost: number;
}

// Window interface extension for Electron IPC

declare global {
  interface Window {
    electron: {
      // Assignment operations
      loadAssignments: () => Promise<Assignment[]>;
      loadAssignment: (timestamp: number) => Promise<AssignmentFile>;
      deleteAssignment: (timestamp: number) => Promise<void>;
      createAssignment: (memberIds: number[]) => Promise<Assignment>;

      // Settings operations
      loadSettings: () => Promise<Settings>;
      saveSettings: (settings: Partial<Settings>) => Promise<void>;

      // Edge weights operations
      loadEdgeWeights: () => Promise<EdgeWeightMap>;
      saveEdgeWeights: (weights: EdgeWeightMap) => Promise<void>;

      // Theme operations
      getSystemTheme: () => Promise<'light' | 'dark'>;
      onSystemThemeChange: (callback: (theme: 'light' | 'dark') => void) => void;
    };
  }
}

export {};
