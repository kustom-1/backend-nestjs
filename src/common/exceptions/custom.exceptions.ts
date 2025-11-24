import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestException extends HttpException {
  constructor(message: string = 'Solicitud inválida') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'No autorizado. Debe iniciar sesión') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        message,
        error: 'Unauthorized',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Acceso denegado. No tiene permisos suficientes') {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message,
        error: 'Forbidden',
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class NotFoundException extends HttpException {
  constructor(resource: string = 'Recurso') {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${resource} no encontrado`,
        error: 'Not Found',
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'El recurso ya existe') {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(errors: string[] | string) {
    const message = Array.isArray(errors) ? errors.join(', ') : errors;
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Error de validación: ${message}`,
        error: 'Validation Error',
        details: errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class DatabaseException extends HttpException {
  constructor(message: string = 'Error en la base de datos') {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message,
        error: 'Database Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
