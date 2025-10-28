import { AuditAction, AuditStatus } from '../audit.schema';

export class CreateAuditDto {
  userId: string;
  username: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  status: AuditStatus;
  method: string;
  endpoint: string;
  requestBody?: Record<string, any>;
  responseData?: Record<string, any>;
  metadata?: {
    previousData?: Record<string, any>;
    newData?: Record<string, any>;
    searchQuery?: string;
    filters?: Record<string, any>;
    affectedRecords?: number;
    [key: string]: any;
  };
  errorMessage?: string;
  ip: string;
  userAgent?: string;
  sessionId?: string;
  duration?: number;
}
