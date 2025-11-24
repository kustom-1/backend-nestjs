import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { GqlArgumentsHost, GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch()
export class GlobalExceptionFilter implements GqlExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    
    // Si es una excepción HTTP de NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse() as any;
      
      return new GraphQLError(
        response.message || exception.message,
        {
          extensions: {
            code: this.getErrorCode(status),
            statusCode: status,
            error: response.error || 'Error',
            details: response.details || null,
          },
        },
      );
    }

    // Errores de TypeORM
    if (exception['code']) {
      return this.handleDatabaseError(exception);
    }

    // Error genérico
    console.error('Unexpected error:', exception);
    return new GraphQLError(
      'Ha ocurrido un error inesperado',
      {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      },
    );
  }

  private getErrorCode(status: number): string {
    const codes = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHENTICATED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
    };
    return codes[status] || 'UNKNOWN_ERROR';
  }

  private handleDatabaseError(exception: any): GraphQLError {
    const code = exception.code;
    
    // Violación de unique constraint
    if (code === '23505') {
      const detail = exception.detail || '';
      const match = detail.match(/Key \((.*?)\)=/);
      const field = match ? match[1] : 'campo';
      
      return new GraphQLError(
        `El ${field} ya existe en el sistema`,
        {
          extensions: {
            code: 'CONFLICT',
            statusCode: HttpStatus.CONFLICT,
            error: 'Duplicate Entry',
          },
        },
      );
    }

    // Violación de foreign key
    if (code === '23503') {
      return new GraphQLError(
        'Operación inválida: el registro está relacionado con otros datos',
        {
          extensions: {
            code: 'BAD_REQUEST',
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Foreign Key Violation',
          },
        },
      );
    }

    // Not null violation
    if (code === '23502') {
      const column = exception.column || 'campo requerido';
      return new GraphQLError(
        `El campo '${column}' es obligatorio`,
        {
          extensions: {
            code: 'BAD_REQUEST',
            statusCode: HttpStatus.BAD_REQUEST,
            error: 'Required Field Missing',
          },
        },
      );
    }

    // Error genérico de base de datos
    return new GraphQLError(
      'Error al procesar la operación en la base de datos',
      {
        extensions: {
          code: 'INTERNAL_SERVER_ERROR',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Database Error',
        },
      },
    );
  }
}
