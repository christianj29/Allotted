// Aggregated counts and compliance metrics for the dashboard.
export interface DashboardSummary {
  counts: { computers: number; devices: number; users: number };
  compliance: {
    computers: { compliant: number; nonCompliant: number };
    devices: { compliant: number; nonCompliant: number };
  };
}

// Auth payload returned by the login endpoint.
export interface LoginResponse {
  token: string;
  user: UserRow;
}

// User row data as returned by the API.
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

// Payload for creating a new user.
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

// Payload for updating a user profile.
export interface UpdateUserRequest {
  fullName: string;
  username: string;
  email: string;
  role: string;
  department: string;
}

// Response envelope for user creation.
export interface CreateUserResponse {
  user: UserRow;
}

// Payload for creating or updating a computer.
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

// Payload for creating or updating a device.
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

// Device entity used throughout the UI.
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

// Computer entity used throughout the UI.
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
  agentId?: string | null;
  user?: string | null;
}
