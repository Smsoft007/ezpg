/**
 * 시스템 API 관련 인터페이스 정의
 */

export interface SystemStatusRequest {
  component?: SystemComponent;
}

export interface SystemStatusResponse {
  status: SystemStatus;
  components: {
    [key in SystemComponent]: {
      status: SystemStatus;
      message?: string;
      updatedAt: string;
    };
  };
  version: string;
  updatedAt: string;
}

export interface SystemMetricsRequest {
  startDate?: string;
  endDate?: string;
  metrics?: SystemMetricType[];
}

export interface SystemMetricsResponse {
  metrics: {
    [key in SystemMetricType]?: SystemMetricData[];
  };
  summary: {
    [key in SystemMetricType]?: {
      min: number;
      max: number;
      avg: number;
      current: number;
    };
  };
}

export interface SystemMetricData {
  timestamp: string;
  value: number;
}

export interface SystemConfigRequest {
  configKey?: string;
}

export interface SystemConfigResponse {
  configs: SystemConfig[];
}

export interface SystemConfig {
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface SystemConfigUpdateRequest {
  configs: {
    key: string;
    value: string;
  }[];
}

export interface SystemConfigUpdateResponse {
  updatedConfigs: string[];
  updatedAt: string;
}

export interface SystemLogRequest {
  startDate?: string;
  endDate?: string;
  level?: SystemLogLevel;
  component?: SystemComponent;
  limit?: number;
  page?: number;
}

export interface SystemLogResponse {
  logs: SystemLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: SystemLogLevel;
  component: SystemComponent;
  message: string;
  details?: Record<string, any>;
}

export interface SystemMaintenanceRequest {
  maintenanceType: SystemMaintenanceType;
  scheduledStart: string;
  scheduledEnd: string;
  description: string;
  affectedComponents: SystemComponent[];
}

export interface SystemMaintenanceResponse {
  maintenanceId: string;
  maintenanceType: SystemMaintenanceType;
  status: SystemMaintenanceStatus;
  scheduledStart: string;
  scheduledEnd: string;
  description: string;
  affectedComponents: SystemComponent[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemMaintenanceUpdateRequest {
  maintenanceId: string;
  status?: SystemMaintenanceStatus;
  scheduledStart?: string;
  scheduledEnd?: string;
  description?: string;
  affectedComponents?: SystemComponent[];
}

export interface SystemMaintenanceUpdateResponse {
  maintenanceId: string;
  status: SystemMaintenanceStatus;
  updatedAt: string;
}

export enum SystemComponent {
  API = 'API',
  DATABASE = 'DATABASE',
  PAYMENT_GATEWAY = 'PAYMENT_GATEWAY',
  VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
  SETTLEMENT = 'SETTLEMENT',
  NOTIFICATION = 'NOTIFICATION',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export enum SystemStatus {
  OPERATIONAL = 'OPERATIONAL',
  DEGRADED = 'DEGRADED',
  PARTIAL_OUTAGE = 'PARTIAL_OUTAGE',
  MAJOR_OUTAGE = 'MAJOR_OUTAGE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum SystemMetricType {
  CPU_USAGE = 'CPU_USAGE',
  MEMORY_USAGE = 'MEMORY_USAGE',
  DISK_USAGE = 'DISK_USAGE',
  API_RESPONSE_TIME = 'API_RESPONSE_TIME',
  API_REQUEST_COUNT = 'API_REQUEST_COUNT',
  API_ERROR_RATE = 'API_ERROR_RATE',
  DATABASE_CONNECTIONS = 'DATABASE_CONNECTIONS',
  PAYMENT_SUCCESS_RATE = 'PAYMENT_SUCCESS_RATE'
}

export enum SystemLogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

export enum SystemMaintenanceType {
  PLANNED = 'PLANNED',
  EMERGENCY = 'EMERGENCY',
  UPGRADE = 'UPGRADE',
  PATCH = 'PATCH'
}

export enum SystemMaintenanceStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}
