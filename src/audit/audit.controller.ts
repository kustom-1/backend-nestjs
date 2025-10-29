import {
  Controller,
  Get,
  Query,
  UseGuards,
  Param,
  Post,
  Delete,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { SkipAudit } from './decorators/audit-log.decorator';

// Asegúrate de tener un guard de autenticación y uno de roles
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../permissions/guards/roles.guard';
// import { Roles } from '../permissions/decorators/roles.decorator';

@Controller('audit')
// @UseGuards(JwtAuthGuard, RolesGuard) // Descomenta cuando tengas los guards
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Obtener logs de auditoría con filtros
   * Solo para Coordinadores
   */
  @Get('logs')
  // @Roles('COORDINADOR') // Descomenta cuando tengas el decorator de roles
  @SkipAudit() // No auditar las consultas de auditoría para evitar recursión
  async getAuditLogs(@Query() query: AuditQueryDto) {
    return this.auditService.getAuditLogs(query);
  }

  /**
   * Obtener actividad de un usuario específico
   */
  @Get('user/:userId')
  // @Roles('COORDINADOR')
  @SkipAudit()
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.getUserActivity(userId, limit);
  }

  /**
   * Obtener estadísticas de auditoría
   */
  @Get('stats')
  // @Roles('COORDINADOR')
  @SkipAudit()
  async getAuditStats(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auditService.getAuditStats(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  /**
   * Obtener historial de cambios de un recurso específico
   */
  @Get('resource/:resource/:resourceId')
  // @Roles('COORDINADOR')
  @SkipAudit()
  async getResourceHistory(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.auditService.getResourceHistory(resource, resourceId);
  }

  /**
   * Limpiar logs antiguos (solo para mantenimiento)
   */
  @Delete('clean')
  // @Roles('ADMIN')
  @SkipAudit()
  async cleanOldLogs(@Query('days') days?: number): Promise<any> {
    return this.auditService.cleanOldLogs(days ? Number(days) : 90);
  }
}
