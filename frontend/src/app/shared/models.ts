export interface DashboardSummary {
  counts: { computers: number; devices: number; users: number };
  compliance: {
    computers: { compliant: number; nonCompliant: number };
    devices: { compliant: number; nonCompliant: number };
  };
}

export interface LoginResponse {
  token: string;
  user: UserRow;
}

export interface UserRow {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  model?: string | null;
  deviceName?: string | null;
  computerName?: string | null;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

export interface UpdateUserRequest {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
}

export interface CreateUserResponse {
  user: UserRow;
}

export interface CreateComputerRequest {
  name: string;
  model: string;
  osVersion?: string;
  serialNumber: string;
  modelIdentifier?: string;
  processorType?: string;
  architectureType?: string;
  cacheSize?: string;
  compliant: boolean;
  userId?: number | null;
}

export interface CreateDeviceRequest {
  name: string;
  model: string;
  osVersion?: string;
  serialNumber: string;
  udid?: string;
  processorType?: string;
  primaryMacAddress?: string;
  secondaryMacAddress?: string;
  compliant: boolean;
  userId?: number | null;
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
