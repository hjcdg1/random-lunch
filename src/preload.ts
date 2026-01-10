/**
 * Preload script - IPC bridge between main and renderer processes
 * This exposes a safe API to the renderer process via contextBridge
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { Assignment, AssignmentFile, EdgeWeightMap, Settings } from './shared/types';

contextBridge.exposeInMainWorld('electron', {
  // Assignment operations
  loadAssignments: (): Promise<Assignment[]> => ipcRenderer.invoke('load-assignments'),

  loadAssignment: (timestamp: number): Promise<AssignmentFile> =>
    ipcRenderer.invoke('load-assignment', timestamp),

  deleteAssignment: (timestamp: number): Promise<void> =>
    ipcRenderer.invoke('delete-assignment', timestamp),

  createAssignment: (memberIds: number[]): Promise<Assignment> =>
    ipcRenderer.invoke('create-assignment', memberIds),

  // Settings operations
  loadSettings: (): Promise<Settings> => ipcRenderer.invoke('load-settings'),

  saveSettings: (settings: Partial<Settings>): Promise<void> =>
    ipcRenderer.invoke('save-settings', settings),

  // Edge weights operations
  loadEdgeWeights: (): Promise<EdgeWeightMap> => ipcRenderer.invoke('load-edge-weights'),

  saveEdgeWeights: (weights: EdgeWeightMap): Promise<void> =>
    ipcRenderer.invoke('save-edge-weights', weights),

  // Theme operations
  getSystemTheme: (): Promise<'light' | 'dark'> => ipcRenderer.invoke('get-system-theme'),

  onSystemThemeChange: (callback: (theme: 'light' | 'dark') => void): void => {
    ipcRenderer.on('system-theme-changed', (_event, theme) => callback(theme));
  },
});
