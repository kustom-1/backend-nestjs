import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AuditLog, SkipAudit } from '../audit/decorators/audit-log.decorator';
import { AuditAction } from '../audit/audit.schema';

/**
 * EJEMPLO: Cómo usar el sistema de auditoría en tus controladores
 * 
 * Este archivo muestra todas las formas de usar el sistema de auditoría
 */

// CASO 1: Registro automático (sin hacer nada)
// ============================================
@Controller('documents')
export class DocumentsControllerAutoAudit {
  
  // ✅ Se registra automáticamente como DOCUMENT_CREATE
  @Post()
  async create(@Body() createDto: any) {
    return { id: '123', title: createDto.title };
  }
  
  // ✅ Se registra automáticamente como DOCUMENT_READ
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { id, title: 'Documento de ejemplo' };
  }
  
  // ✅ Se registra automáticamente como DOCUMENT_UPDATE
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return { id, ...updateDto };
  }
  
  // ✅ Se registra automáticamente como DOCUMENT_DELETE
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return { message: 'Deleted' };
  }
}


// CASO 2: Registro con metadata personalizada
// ============================================
@Controller('documents-advanced')
export class DocumentsControllerCustomAudit {
  
  // ✅ Especifica exactamente qué acción registrar
  @Post()
  @AuditLog({
    action: AuditAction.DOCUMENT_CREATE,
    resource: 'documents',
    metadata: { 
      category: 'prestamos',
      importance: 'high' 
    }
  })
  async create(@Body() createDto: any) {
    return { id: '123', title: createDto.title };
  }
  
  // ✅ Para búsquedas, registra los filtros usados
  @Get('search')
  @AuditLog({
    action: AuditAction.DOCUMENT_SEARCH,
    resource: 'documents',
  })
  async search(@Query() query: any) {
    // El interceptor guardará automáticamente los query params
    return [
      { id: '1', title: 'Resultado 1' },
      { id: '2', title: 'Resultado 2' },
    ];
  }
  
  // ✅ Para descargas, marca explícitamente
  @Get(':id/download')
  @AuditLog({
    action: AuditAction.DOCUMENT_DOWNLOAD,
    resource: 'documents',
  })
  async download(@Param('id') id: string) {
    return { url: `https://storage.example.com/docs/${id}` };
  }
}


// CASO 3: Excluir endpoints de auditoría
// =======================================
@Controller('health')
export class HealthController {
  
  // ❌ NO se registra (endpoints públicos/health checks)
  @Get()
  @SkipAudit()
  healthCheck() {
    return { status: 'ok', timestamp: new Date() };
  }
  
  @Get('metrics')
  @SkipAudit()
  getMetrics() {
    return { cpu: 45, memory: 60 };
  }
}


// CASO 4: Préstamos (ejemplo completo)
// ====================================
@Controller('loans')
export class LoansController {
  
  @Post()
  @AuditLog({
    action: AuditAction.LOAN_CREATE,
    resource: 'loans',
    metadata: { type: 'new_loan' }
  })
  async createLoan(@Body() loanDto: any) {
    return {
      id: 'loan-123',
      documentId: loanDto.documentId,
      userId: loanDto.userId,
      dueDate: loanDto.dueDate,
    };
  }
  
  @Put(':id/return')
  @AuditLog({
    action: AuditAction.LOAN_RETURN,
    resource: 'loans',
  })
  async returnLoan(@Param('id') id: string) {
    return { id, status: 'returned', returnedAt: new Date() };
  }
  
  @Get(':id')
  @AuditLog({
    action: AuditAction.LOAN_READ,
    resource: 'loans',
  })
  async getLoan(@Param('id') id: string) {
    return { id, status: 'active' };
  }
}


// CASO 5: Usuarios (con cambios de permisos)
// ==========================================
@Controller('users')
export class UsersControllerAudit {
  
  @Post()
  @AuditLog({
    action: AuditAction.USER_CREATE,
    resource: 'users',
  })
  async createUser(@Body() createUserDto: any) {
    // Password será automáticamente sanitizado en el log
    return { id: 'user-123', email: createUserDto.email };
  }
  
  @Put(':id/role')
  @AuditLog({
    action: AuditAction.ROLE_CHANGE,
    resource: 'users',
  })
  async changeRole(@Param('id') id: string, @Body() roleDto: any) {
    return { 
      userId: id, 
      oldRole: 'USUARIO', 
      newRole: roleDto.role 
    };
  }
  
  @Put(':id/permissions')
  @AuditLog({
    action: AuditAction.PERMISSION_CHANGE,
    resource: 'users',
  })
  async updatePermissions(@Param('id') id: string, @Body() permissionsDto: any) {
    return { 
      userId: id, 
      permissions: permissionsDto.permissions 
    };
  }
}


// CASO 6: Auditoría manual desde el servicio
// ==========================================
import { Injectable } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { AuditStatus } from '../audit/audit.schema';

@Injectable()
export class DocumentsServiceManualAudit {
  constructor(private auditService: AuditService) {}
  
  async updateWithHistory(id: string, updateDto: any, userId: string, username: string) {
    // 1. Obtener datos anteriores
    const previousData = { title: 'Título antiguo', status: 'draft' };
    
    // 2. Realizar actualización
    const newData = { title: updateDto.title, status: updateDto.status };
    
    // 3. Guardar en BD (simulado)
    // await this.documentsRepository.update(id, updateDto);
    
    // 4. Registrar con datos antes/después
    await this.auditService.createAuditLog({
      userId,
      username,
      action: AuditAction.DOCUMENT_UPDATE,
      resource: 'documents',
      resourceId: id,
      status: AuditStatus.SUCCESS,
      method: 'PUT',
      endpoint: `/documents/${id}`,
      requestBody: updateDto,
      metadata: {
        previousData: {
          title: previousData.title,
          status: previousData.status,
        },
        newData: {
          title: newData.title,
          status: newData.status,
        },
        affectedRecords: 1,
        changeType: 'full_update',
      },
      ip: '192.168.1.1', // Obtener del request
      userAgent: 'Mozilla/5.0...', // Obtener del request
    });
    
    return newData;
  }
  
  async bulkDelete(ids: string[], userId: string, username: string) {
    // Operación de eliminación masiva
    const deletedCount = ids.length;
    
    // Registrar la operación masiva
    await this.auditService.createAuditLog({
      userId,
      username,
      action: AuditAction.DOCUMENT_DELETE,
      resource: 'documents',
      status: AuditStatus.SUCCESS,
      method: 'DELETE',
      endpoint: '/documents/bulk-delete',
      requestBody: { ids },
      metadata: {
        affectedRecords: deletedCount,
        deletedIds: ids,
        operationType: 'bulk_delete',
      },
      ip: '192.168.1.1',
    });
    
    return { deleted: deletedCount };
  }
}


// CASO 7: Búsquedas avanzadas con metadata
// ========================================
@Injectable()
export class SearchServiceWithAudit {
  constructor(private auditService: AuditService) {}
  
  async advancedSearch(
    query: string, 
    filters: any, 
    userId: string, 
    username: string,
  ) {
    // Realizar búsqueda
    const results = [
      { id: '1', title: 'Resultado 1' },
      { id: '2', title: 'Resultado 2' },
    ];
    
    // Registrar la búsqueda con todos los detalles
    await this.auditService.createAuditLog({
      userId,
      username,
      action: AuditAction.DOCUMENT_SEARCH,
      resource: 'documents',
      status: AuditStatus.SUCCESS,
      method: 'GET',
      endpoint: '/documents/search',
      metadata: {
        searchQuery: query,
        filters: {
          category: filters.category,
          dateRange: filters.dateRange,
          status: filters.status,
        },
        affectedRecords: results.length,
        resultCount: results.length,
        searchType: 'advanced',
      },
      ip: '192.168.1.1',
    });
    
    return results;
  }
}

/**
 * RESUMEN DE BUENAS PRÁCTICAS:
 * 
 * 1. Para operaciones CRUD simples: No hagas nada, el interceptor se encarga
 * 
 * 2. Para operaciones con metadata importante: Usa @AuditLog()
 * 
 * 3. Para operaciones complejas (con antes/después): Usa AuditService.createAuditLog()
 * 
 * 4. Para endpoints públicos/health: Usa @SkipAudit()
 * 
 * 5. Siempre incluye metadata relevante para el Coordinador:
 *    - Datos antes/después del cambio
 *    - Número de registros afectados
 *    - Filtros de búsqueda
 *    - Cualquier dato que ayude a entender QUÉ hizo el usuario
 */
