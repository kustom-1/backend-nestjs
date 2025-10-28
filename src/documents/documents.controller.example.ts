import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  UseGuards,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AbacGuard } from '../permissions/guards/abac.guard';
import { 
  RequiredPermission, 
  RequiredPermissionWithOwnership 
} from '../permissions/decorators/abac.decorator';

// Ejemplo de entidad documento (simplificado)
interface Document {
  id: number;
  title: string;
  content: string;
  userId: number; // ID del creador/propietario
  createdAt: Date;
  isPublic: boolean;
}

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(AbacGuard)
export class DocumentsController {
  
  // Endpoint público - Cualquier usuario autenticado con rol que tenga permiso 'consultar:documents'
  @Get()
  @ApiOperation({ summary: 'Listar documentos públicos' })
  @RequiredPermission('consultar', 'documents')
  async getPublicDocuments() {
    // Lógica para obtener solo documentos públicos
    return {
      success: true,
      message: 'Documentos públicos obtenidos',
      data: [] // documentos públicos
    };
  }

  // Endpoint con ownership - Solo el creador puede ver sus documentos privados
  @Get('my-documents')
  @ApiOperation({ summary: 'Listar mis documentos' })
  @RequiredPermission('consultar', 'documents')
  async getMyDocuments(@Request() req: any) {
    const userId = req.user.id;
    
    // Lógica para obtener documentos del usuario
    return {
      success: true,
      message: 'Mis documentos obtenidos',
      data: [], // documentos del usuario
      userId
    };
  }

  // Endpoint específico con ownership - Solo el propietario o usuarios con permisos especiales
  @Get(':id')
  @ApiOperation({ summary: 'Obtener documento específico' })
  @RequiredPermissionWithOwnership('consultar', 'documents', 'userId')
  async getDocument(@Param('id') id: number) {
    // El guard verificará automáticamente:
    // 1. Si el usuario es propietario del documento (userId del documento === usuario actual)
    // 2. Si no es propietario, verificará si su rol tiene permisos para 'consultar:documents'
    // 3. Si no tiene permisos de rol, verificará permisos específicos del usuario
    
    return {
      success: true,
      message: 'Documento obtenido',
      data: { id, title: 'Documento ejemplo', userId: 123 } // documento específico
    };
  }

  // Crear documento - Cualquier usuario con permiso 'subir:documents'
  @Post()
  @ApiOperation({ summary: 'Crear nuevo documento' })
  @RequiredPermission('subir', 'documents')
  async createDocument(@Body() createData: any, @Request() req: any) {
    const userId = req.user.id;
    
    // El documento se crea automáticamente con el userId del creador
    const newDocument = {
      ...createData,
      userId, // Asignar ownership automáticamente
      createdAt: new Date()
    };
    
    return {
      success: true,
      message: 'Documento creado exitosamente',
      data: newDocument
    };
  }

  // Editar documento - Solo el propietario o usuarios con permisos especiales
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar documento' })
  @RequiredPermissionWithOwnership('editar', 'documents', 'userId')
  async updateDocument(@Param('id') id: number, @Body() updateData: any) {
    // El guard verificará ownership automáticamente
    return {
      success: true,
      message: 'Documento actualizado',
      data: { id, ...updateData }
    };
  }

  // Eliminar documento - Solo el propietario o usuarios con permisos especiales
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar documento' })
  @RequiredPermissionWithOwnership('eliminar', 'documents', 'userId')
  async deleteDocument(@Param('id') id: number) {
    // El guard verificará ownership automáticamente
    return {
      success: true,
      message: 'Documento eliminado'
    };
  }

  // Prestar documento - Solo usuarios con permiso de rol (no ownership)
  @Post(':id/loan')
  @ApiOperation({ summary: 'Prestar documento' })
  @RequiredPermission('prestar', 'documents')
  async loanDocument(@Param('id') id: number, @Body() loanData: any) {
    // Este endpoint NO verifica ownership, solo permisos de rol
    // Útil para acciones administrativas que no dependen del propietario
    return {
      success: true,
      message: 'Documento prestado',
      data: { id, ...loanData }
    };
  }
}

/*
EJEMPLOS DE USO:

1. CASO BÁSICO - Pepito crea un documento:
   POST /documents { title: "Mi documento", content: "..." }
   -> Se crea con userId = Pepito.id automáticamente

2. CASO OWNERSHIP - Pepito quiere ver SU documento:
   GET /documents/123
   -> Guard verifica: documento.userId === Pepito.id? ✅ PERMITIDO

3. CASO ROLE PERMISSION - María (COORDINADOR) quiere ver documento de Pepito:
   GET /documents/123
   -> Guard verifica: 
      - documento.userId === María.id? ❌ NO es propietaria
      - María.role tiene permiso 'consultar:documents'? ✅ COORDINADOR sí puede
      - PERMITIDO

4. CASO DENEGADO - Juan (CONSULTOR) quiere editar documento de Pepito:
   PUT /documents/123
   -> Guard verifica:
      - documento.userId === Juan.id? ❌ NO es propietario  
      - Juan.role tiene permiso 'editar:documents'? ❌ CONSULTOR no puede editar
      - Juan tiene permiso específico? ❌ NO
      - DENEGADO

5. CASO ADMINISTRATIVO - María (COORDINADOR) presta cualquier documento:
   POST /documents/123/loan
   -> Guard verifica solo permisos de rol, NO ownership
   -> María.role tiene permiso 'prestar:documents'? ✅ COORDINADOR sí puede
   -> PERMITIDO
*/ 