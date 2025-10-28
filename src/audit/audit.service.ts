import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Audit, AuditDocument, AuditAction } from './audit.schema';
import { CreateAuditDto } from './dto/create-audit.dto';
import { AuditQueryDto } from './dto/audit-query.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(Audit.name) private auditModel: Model<AuditDocument>,
  ) {}

  /**
   * Crea un registro de auditoría
   */
  async createAuditLog(createAuditDto: CreateAuditDto): Promise<Audit> {
    try {
      // Sanitizar datos sensibles
      const sanitizedDto = this.sanitizeData(createAuditDto);
      
      const auditLog = new this.auditModel({
        ...sanitizedDto,
        timestamp: new Date(),
      });

      return await auditLog.save();
    } catch (error) {
      this.logger.error(`Error creating audit log: ${error.message}`, error.stack);
      // No lanzar error para no interrumpir el flujo principal
      return null;
    }
  }

  /**
   * Obtiene logs de auditoría con filtros (para el Coordinador)
   */
  async getAuditLogs(query: AuditQueryDto) {
    const {
      userId,
      username,
      action,
      resource,
      resourceId,
      status,
      startDate,
      endDate,
      searchQuery,
      page = 1,
      limit = 50,
    } = query;

    const filter: any = {};

    if (userId) filter.userId = userId;
    if (username) filter.username = new RegExp(username, 'i');
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (resourceId) filter.resourceId = resourceId;
    if (status) filter.status = status;

    // Filtro de fechas
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    // Búsqueda de texto en múltiples campos
    if (searchQuery) {
      filter.$or = [
        { username: new RegExp(searchQuery, 'i') },
        { endpoint: new RegExp(searchQuery, 'i') },
        { 'metadata.searchQuery': new RegExp(searchQuery, 'i') },
      ];
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditModel
        .find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditModel.countDocuments(filter).exec(),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtiene actividad de un usuario específico
   */
  async getUserActivity(userId: string, limit: number = 100) {
    return this.auditModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  /**
   * Obtiene estadísticas de auditoría
   */
  async getAuditStats(userId?: string, startDate?: Date, endDate?: Date) {
    const matchStage: any = {};
    
    if (userId) matchStage.userId = userId;
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = startDate;
      if (endDate) matchStage.timestamp.$lte = endDate;
    }

    const stats = await this.auditModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalActions: { $sum: 1 },
          successActions: {
            $sum: { $cond: [{ $eq: ['$status', 'SUCCESS'] }, 1, 0] },
          },
          failedActions: {
            $sum: { $cond: [{ $eq: ['$status', 'FAILED'] }, 1, 0] },
          },
          errorActions: {
            $sum: { $cond: [{ $eq: ['$status', 'ERROR'] }, 1, 0] },
          },
          actionsByType: { $push: '$action' },
        },
      },
    ]);

    // Contar acciones por tipo
    const actionsByType = await this.auditModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Usuarios más activos
    const mostActiveUsers = await this.auditModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { userId: '$userId', username: '$username' },
          activityCount: { $sum: 1 },
        },
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 },
    ]);

    return {
      summary: stats[0] || {
        totalActions: 0,
        successActions: 0,
        failedActions: 0,
        errorActions: 0,
      },
      actionsByType,
      mostActiveUsers: mostActiveUsers.map((u) => ({
        userId: u._id.userId,
        username: u._id.username,
        activityCount: u.activityCount,
      })),
    };
  }

  /**
   * Obtiene el historial de cambios de un recurso específico
   */
  async getResourceHistory(resource: string, resourceId: string) {
    return this.auditModel
      .find({ resource, resourceId })
      .sort({ timestamp: -1 })
      .lean()
      .exec();
  }

  /**
   * Limpia registros antiguos (opcional, para mantener la BD)
   */
  async cleanOldLogs(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditModel.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    this.logger.log(`Cleaned ${result.deletedCount} old audit logs`);
    return result;
  }

  /**
   * Sanitiza datos sensibles antes de guardar
   */
  private sanitizeData(dto: CreateAuditDto): CreateAuditDto {
    const sanitized = { ...dto };

    // Remover passwords y tokens del request body
    if (sanitized.requestBody) {
      const cleanBody = { ...sanitized.requestBody };
      delete cleanBody.password;
      delete cleanBody.token;
      delete cleanBody.refreshToken;
      delete cleanBody.accessToken;
      sanitized.requestBody = cleanBody;
    }

    // Limitar tamaño de responseData
    if (sanitized.responseData) {
      const responseStr = JSON.stringify(sanitized.responseData);
      if (responseStr.length > 10000) {
        // Si la respuesta es muy grande, solo guardar resumen
        sanitized.responseData = {
          _truncated: true,
          _originalSize: responseStr.length,
          _summary: 'Response too large to store completely',
        };
      }
    }

    return sanitized;
  }

  /**
   * Mapea endpoints a acciones de auditoría
   */
  static mapEndpointToAction(method: string, endpoint: string): AuditAction {
    const path = endpoint.toLowerCase();

    // Documentos
    if (path.includes('document')) {
      if (method === 'POST') return AuditAction.DOCUMENT_CREATE;
      if (method === 'PUT' || method === 'PATCH') return AuditAction.DOCUMENT_UPDATE;
      if (method === 'DELETE') return AuditAction.DOCUMENT_DELETE;
      if (path.includes('search')) return AuditAction.DOCUMENT_SEARCH;
      if (path.includes('download')) return AuditAction.DOCUMENT_DOWNLOAD;
      return AuditAction.DOCUMENT_READ;
    }

    // Préstamos
    if (path.includes('loan')) {
      if (method === 'POST') return AuditAction.LOAN_CREATE;
      if (method === 'PUT' || method === 'PATCH') return AuditAction.LOAN_UPDATE;
      if (path.includes('return')) return AuditAction.LOAN_RETURN;
      return AuditAction.LOAN_READ;
    }

    // Usuarios
    if (path.includes('user')) {
      if (method === 'POST') return AuditAction.USER_CREATE;
      if (method === 'PUT' || method === 'PATCH') return AuditAction.USER_UPDATE;
      if (method === 'DELETE') return AuditAction.USER_DELETE;
      return AuditAction.USER_READ;
    }

    // Autenticación
    if (path.includes('login')) return AuditAction.LOGIN_SUCCESS;
    if (path.includes('logout')) return AuditAction.LOGOUT;

    // Permisos
    if (path.includes('permission')) return AuditAction.PERMISSION_CHANGE;
    if (path.includes('role')) return AuditAction.ROLE_CHANGE;

    return AuditAction.OTHER;
  }

  /**
   * Extrae el nombre del recurso desde el endpoint
   */
  static extractResource(endpoint: string): string {
    const parts = endpoint.split('/').filter(Boolean);
    return parts[0] || 'unknown';
  }
}
