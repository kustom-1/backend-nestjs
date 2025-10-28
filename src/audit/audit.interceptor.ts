import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuditStatus } from './audit.schema';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Verificar si la ruta debe ser auditada
    const skipAudit = this.reflector.get<boolean>(
      'skipAudit',
      context.getHandler(),
    );

    if (skipAudit) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { user, method, originalUrl, body, ip, headers } = request;

    // Si no hay usuario autenticado, no auditar (excepto login)
    if (!user && !originalUrl.includes('login')) {
      return next.handle();
    }

    const startTime = Date.now();

    // Obtener metadata personalizada del decorator @AuditLog
    const auditMetadata = this.reflector.get<{
      action?: any;
      resource?: string;
      resourceId?: string;
      metadata?: Record<string, any>;
    }>('auditMetadata', context.getHandler());

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;

        // Crear log de auditoría exitoso
        this.auditService.createAuditLog({
          userId: user?.id || user?.sub || 'anonymous',
          username: user?.username || user?.email || 'anonymous',
          action: auditMetadata?.action || 
                  AuditService.mapEndpointToAction(method, originalUrl),
          resource: auditMetadata?.resource || 
                    AuditService.extractResource(originalUrl),
          resourceId: auditMetadata?.resourceId || 
                      this.extractResourceId(originalUrl, response),
          status: AuditStatus.SUCCESS,
          method,
          endpoint: originalUrl,
          requestBody: this.sanitizeBody(body),
          responseData: this.sanitizeResponse(response),
          metadata: auditMetadata?.metadata || {},
          ip: ip || request.connection?.remoteAddress,
          userAgent: headers['user-agent'],
          sessionId: headers['x-session-id'] || request.sessionID,
          duration,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        // Crear log de auditoría de error
        this.auditService.createAuditLog({
          userId: user?.id || user?.sub || 'anonymous',
          username: user?.username || user?.email || 'anonymous',
          action: auditMetadata?.action || 
                  AuditService.mapEndpointToAction(method, originalUrl),
          resource: auditMetadata?.resource || 
                    AuditService.extractResource(originalUrl),
          resourceId: auditMetadata?.resourceId,
          status: AuditStatus.ERROR,
          method,
          endpoint: originalUrl,
          requestBody: this.sanitizeBody(body),
          errorMessage: error.message || 'Unknown error',
          metadata: auditMetadata?.metadata || {},
          ip: ip || request.connection?.remoteAddress,
          userAgent: headers['user-agent'],
          sessionId: headers['x-session-id'] || request.sessionID,
          duration,
        });

        return throwError(() => error);
      }),
    );
  }

  private extractResourceId(url: string, response?: any): string | undefined {
    // Intentar extraer ID de la URL (ej: /documents/123)
    const parts = url.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    
    // Si el último segmento es un ID (número o UUID)
    if (/^[0-9a-f-]+$/i.test(lastPart) && !lastPart.includes('?')) {
      return lastPart;
    }

    // Intentar extraer del response
    if (response?.id) return response.id;
    if (response?._id) return response._id;
    if (response?.data?.id) return response.data.id;
    if (response?.data?._id) return response.data._id;

    return undefined;
  }

  private sanitizeBody(body: any): Record<string, any> | undefined {
    if (!body || typeof body !== 'object') return undefined;

    const sanitized = { ...body };
    
    // Remover campos sensibles
    const sensitiveFields = [
      'password',
      'token',
      'refreshToken',
      'accessToken',
      'secret',
      'apiKey',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    });

    return sanitized;
  }

  private sanitizeResponse(response: any): Record<string, any> | undefined {
    if (!response) return undefined;

    // Si la respuesta es muy grande, no guardarla completa
    const responseStr = JSON.stringify(response);
    if (responseStr.length > 5000) {
      return {
        _truncated: true,
        _size: responseStr.length,
        _type: Array.isArray(response) ? 'array' : typeof response,
        _itemCount: Array.isArray(response) ? response.length : undefined,
      };
    }

    return response;
  }
}
