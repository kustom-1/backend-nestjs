import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditDocument = Audit & Document;

export enum AuditAction {
  // Documentos
  DOCUMENT_CREATE = 'DOCUMENT_CREATE',
  DOCUMENT_READ = 'DOCUMENT_READ',
  DOCUMENT_UPDATE = 'DOCUMENT_UPDATE',
  DOCUMENT_DELETE = 'DOCUMENT_DELETE',
  DOCUMENT_SEARCH = 'DOCUMENT_SEARCH',
  DOCUMENT_DOWNLOAD = 'DOCUMENT_DOWNLOAD',
  
  // Préstamos
  LOAN_CREATE = 'LOAN_CREATE',
  LOAN_UPDATE = 'LOAN_UPDATE',
  LOAN_RETURN = 'LOAN_RETURN',
  LOAN_READ = 'LOAN_READ',
  
  // Usuarios
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_READ = 'USER_READ',
  
  // Autenticación
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  
  // Permisos
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  ROLE_CHANGE = 'ROLE_CHANGE',
  
  // Otros
  OTHER = 'OTHER',
}

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
}

@Schema({ timestamps: true, collection: 'audit_logs' })
export class Audit {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true, enum: AuditAction })
  action: AuditAction;

  @Prop({ required: true })
  resource: string; // Ej: 'documents', 'users', 'loans'

  @Prop()
  resourceId?: string; // ID del recurso afectado

  @Prop({ required: true, enum: AuditStatus })
  status: AuditStatus;

  @Prop({ required: true })
  method: string; // GET, POST, PUT, DELETE

  @Prop({ required: true })
  endpoint: string; // URL del endpoint

  @Prop({ type: Object })
  requestBody?: Record<string, any>; // Datos enviados (sin passwords)

  @Prop({ type: Object })
  responseData?: Record<string, any>; // Respuesta (resumida si es muy grande)

  @Prop({ type: Object })
  metadata?: {
    previousData?: Record<string, any>; // Datos antes del cambio
    newData?: Record<string, any>; // Datos después del cambio
    searchQuery?: string; // Consulta de búsqueda
    filters?: Record<string, any>; // Filtros aplicados
    affectedRecords?: number; // Número de registros afectados
    [key: string]: any; // Campos adicionales específicos
  };

  @Prop()
  errorMessage?: string;

  @Prop({ required: true })
  ip: string;

  @Prop()
  userAgent?: string;

  @Prop()
  sessionId?: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;

  @Prop()
  duration?: number; // Duración de la operación en ms
}

export const AuditSchema = SchemaFactory.createForClass(Audit);

// Índices para mejorar las consultas del Coordinador
AuditSchema.index({ userId: 1, timestamp: -1 });
AuditSchema.index({ action: 1, timestamp: -1 });
AuditSchema.index({ resource: 1, timestamp: -1 });
AuditSchema.index({ timestamp: -1 });
AuditSchema.index({ username: 1, timestamp: -1 });
