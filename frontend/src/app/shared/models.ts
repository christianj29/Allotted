export interface DashboardSummary {
  counts: { computers: number; devices: number; users: number };
  compliance: {
    computers: { compliant: number; nonCompliant: number };
    devices: { compliant: number; nonCompliant: number };
  };
}

export interface UserRow {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  model?: string | null;
  deviceName?: string | null;
  computerName?: string | null;
}

export interface Device {
  id: number;
  name: string;
  model: string;
  osVersion?: string;
  serialNumber: string;
  udid?: string;
  compliant: boolean;
  processorType?: string;
  primaryMacAddress?: string;
  secondaryMacAddress?: string;
  user?: string | null;
}

export interface Computer {
  id: number;
  name: string;
  model: string;
  osVersion?: string;
  serialNumber: string;
  modelIdentifier?: string;
  compliant: boolean;
  processorType?: string;
  architectureType?: string;
  cacheSize?: string;
  user?: string | null;
}
