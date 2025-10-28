import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../audit.schema';

export interface AuditLogMetadata {
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

/**
 * Decorator para personalizar el logging de auditoría en endpoints específicos
 * 
 * @example
 * @AuditLog({
 *   action: AuditAction.DOCUMENT_CREATE,
 *   resource: 'documents',
 *   metadata: { category: 'important' }
 * })
 * createDocument() { ... }
 */
export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata('auditMetadata', metadata);

/**
 * Decorator para excluir un endpoint del logging de auditoría
 * 
 * @example
 * @SkipAudit()
 * healthCheck() { ... }
 */
export const SkipAudit = () => SetMetadata('skipAudit', true);
