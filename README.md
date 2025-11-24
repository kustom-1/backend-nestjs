# Kustom API - GraphQL Backend

API GraphQL para la gestión de usuarios, categorías y prendas personalizables. Sistema de autenticación JWT con control de acceso basado en roles (RBAC/ABAC).

## Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Reference](#api-reference)
- [Roles y Permisos](#roles-y-permisos)

## Características

- **Autenticación JWT** - Sistema de login y registro seguro
- **Gestión de Usuarios** - CRUD completo con roles diferenciados
- **Categorías** - Organización de productos por categorías
- **Prendas Personalizables** - Catálogo de productos con precios y modelos
- **Control de Acceso** - Sistema ABAC (Attribute-Based Access Control)
- **100% GraphQL** - Sin endpoints REST
- **Auto-Seeding** - Datos de prueba precargados
- **Docker Ready** - Contenedores para desarrollo local

## Tecnologías

- **NestJS 11** - Framework backend
- **GraphQL** - API query language
- **Apollo Server** - GraphQL server
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL 15** - Base de datos
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas
- **Docker** - Contenedorización

## Requisitos Previos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker y Docker Compose (para base de datos)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/kustom-1/backend-nestjs.git
cd backend-nestjs
git checkout graph
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=app_db
DB_SSLMODE=disable

# Application
APP_PORT=3000

# PgAdmin (opcional)
PGADMIN_EMAIL=admin@kustom.com
PGADMIN_PASSWORD=admin123
PGADMIN_PORT=5050
```

### 4. Levantar la base de datos

```bash
docker-compose up -d postgres
```

### 5. Iniciar la aplicación

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

La aplicación estará disponible en:
- **GraphQL Playground:** http://localhost:3000/graphql
- **API GraphQL:** http://localhost:3000/graphql

## Configuración

### Base de Datos

La aplicación se conecta automáticamente a PostgreSQL y:
- Crea las tablas automáticamente (`synchronize: true`)
- Ejecuta los seeds si la base de datos está vacía
- Configura 116 permisos por defecto

### PgAdmin (Opcional)

Para administrar la base de datos visualmente:

```bash
docker-compose up -d pgadmin
```

Accede en http://localhost:5050 con:
- Email: `admin@kustom.com`
- Password: `admin123`

## Uso

### Acceder a GraphQL Playground

Abre tu navegador en http://localhost:3000/graphql

### Autenticación

1. **Login** para obtener el token:

```graphql
mutation {
  login(loginInput: {
    email: "admin@kustom.com"
    password: "1234"
  }) {
    access_token
    user {
      id
      email
      role
    }
  }
}
```

2. **Añadir el token** en los headers (panel inferior del Playground):

```json
{
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
```

### Usuarios de Prueba

| Email | Password | Rol | Permisos |
|-------|----------|-----|----------|
| admin@kustom.com | 1234 | COORDINADOR | Acceso completo |
| raul@admin.com | 1234 | COORDINADOR | Acceso completo |
| carlos@consultor.com | 1234 | CONSULTOR | Ver y crear prendas |
| maria@auxiliar.com | 1234 | AUXILIAR | Ver todo, crear categorías |
| juan@kustom.com | 1234 | CONSULTOR | Ver y crear prendas |

## API Reference

### Queries y Mutations Públicas

#### Autenticación

```graphql
# Registrar nuevo usuario
mutation {
  register(createUserInput: {
    email: "nuevo@example.com"
    password: "123456"
    firstName: "Nuevo"
    lastName: "Usuario"
    role: CONSULTOR
  }) {
    access_token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}

# Login
mutation {
  login(loginInput: {
    email: "admin@kustom.com"
    password: "1234"
  }) {
    access_token
    user {
      id
      email
      firstName
      lastName
      role
    }
  }
}
```

#### Categorías

```graphql
# Listar todas las categorías
query {
  categories {
    id
    name
    description
  }
}

# Obtener categoría por ID
query {
  category(id: 1) {
    id
    name
    description
  }
}
```

#### Prendas/Cloths

```graphql
# Listar todas las prendas
query {
  cloths {
    id
    name
    description
    basePrice
    modelUrl
    category {
      id
      name
    }
  }
}

# Obtener prenda por ID
query {
  cloth(id: 1) {
    id
    name
    basePrice
    category {
      name
    }
  }
}
```

### Queries y Mutations Protegidas

#### Usuario Actual

```graphql
# Ver mi perfil (requiere autenticación)
query {
  me {
    id
    email
    firstName
    lastName
    role
    isActive
  }
}
```

#### Usuarios (Solo COORDINADOR)

```graphql
# Listar usuarios
query {
  users {
    id
    email
    firstName
    lastName
    role
    isActive
  }
}

# Crear usuario
mutation {
  createUser(createUserInput: {
    email: "test@example.com"
    password: "123456"
    firstName: "Test"
    lastName: "User"
    role: CONSULTOR
  }) {
    id
    email
    role
  }
}

# Actualizar usuario
mutation {
  updateUser(updateUserInput: {
    id: 5
    firstName: "Nombre Actualizado"
    role: AUXILIAR
  }) {
    id
    firstName
    role
  }
}

# Eliminar usuario
mutation {
  deleteUser(id: 5)
}
```

#### Categorías (Mutations - Solo COORDINADOR)

```graphql
# Crear categoría
mutation {
  createCategory(createCategoryInput: {
    name: "Nueva Categoría"
    description: "Descripción"
  }) {
    id
    name
    description
  }
}

# Actualizar categoría
mutation {
  updateCategory(updateCategoryInput: {
    id: 6
    name: "Categoría Actualizada"
  }) {
    id
    name
  }
}

# Eliminar categoría
mutation {
  deleteCategory(id: 6)
}
```

#### Prendas (Mutations - Requiere permisos)

```graphql
# Crear prenda
mutation {
  createCloth(createClothInput: {
    name: "Camiseta Nueva"
    description: "Descripción"
    basePrice: 25000
    category: 1
    modelUrl: "https://example.com/model.png"
  }) {
    id
    name
    basePrice
    category {
      name
    }
  }
}

# Actualizar prenda
mutation {
  updateCloth(updateClothInput: {
    id: 8
    name: "Camiseta Actualizada"
    basePrice: 30000
  }) {
    id
    name
    basePrice
  }
}

# Eliminar prenda
mutation {
  deleteCloth(id: 8)
}
```

## Roles y Permisos

### COORDINADOR (Administrador)
- **Users:** CRUD completo
- **Categories:** CRUD completo
- **Cloths:** CRUD completo
- Acceso total a la plataforma

### CONSULTOR (Usuario Regular)
- **Categories:** Solo lectura
- **Cloths:** Lectura y creación (prendas personalizadas)
- No puede gestionar usuarios ni categorías

### AUXILIAR (Asistente)
- **Categories:** Lectura y creación
- **Cloths:** Solo lectura
- **Users:** Solo lectura
- No puede crear usuarios

## Estructura del Proyecto

```
src/
├── auth/                 # Autenticación JWT
│   ├── auth.resolver.ts  # Login, Register, Me
│   ├── auth.service.ts
│   └── guards/
├── users/                # Gestión de usuarios
│   ├── users.resolver.ts
│   ├── users.service.ts
│   └── users.entity.ts
├── categories/           # Gestión de categorías
│   ├── categories.resolver.ts
│   ├── categories.service.ts
│   └── category.entity.ts
├── cloths/              # Gestión de prendas
│   ├── cloths.resolver.ts
│   ├── cloths.service.ts
│   └── cloth.entity.ts
├── permissions/         # Sistema de permisos
│   ├── permissions.service.ts
│   ├── role-permission.entity.ts
│   └── guards/
├── database/            # Seeds y configuración DB
└── storage/             # Estrategia de conexión DB
```

## Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## Docker

### Servicios disponibles

```bash
# Solo PostgreSQL
docker-compose up -d postgres

# PostgreSQL + PgAdmin
docker-compose up -d postgres pgadmin

# Todo (incluye backend)
docker-compose up -d
```

### Detener servicios

```bash
docker-compose down
```

## Scripts Disponibles

```bash
npm run start          # Iniciar en modo normal
npm run start:dev      # Iniciar en modo desarrollo (HMR)
npm run start:prod     # Iniciar en modo producción
npm run build          # Compilar el proyecto
npm run lint           # Ejecutar linter
npm run format         # Formatear código
npm run seed           # Ejecutar seeds manualmente
```

---

**Nota:** Esta es la rama `graph` con implementación 100% GraphQL. La versión REST original está en la rama principal.
