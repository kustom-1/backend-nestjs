# backend-nestjs

## 🚀 **Inicio Rápido**

### **Prerequisitos**

- Docker & Docker Compose
- Node.js 18+ (para desarrollo local)
- npm o yarn

### **Levantar el Entorno**

```bash
# Clonar el repositorio
git clone <repository-url>
cd backend-nestjs

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.docker.example .env

# Levantar bases de datos y pgAdmin
docker-compose up -d

# Iniciar la aplicación (espera a que se creen las tablas)
npm run start:dev

# En otra terminal, ejecutar el seeding de datos
npm run seed
```

### **URLs de Acceso**

- **API**: http://localhost:3000
- **pgAdmin**: http://localhost:5050
  - Email: `admin@kustom.com`
  - Contraseña: `admin123`
- **PostgreSQL**: localhost:5432
- **MongoDB**: localhost:27017

### **Usuarios de Prueba**

Todos con contraseña `1234`:

| Email | Rol | Uso |
|-------|-----|-----|
| raul@admin.com | Coordinador | Usado en colección Postman |
| carlos@consultor.com | Consultor | Testing de permisos |
| maria@auxiliar.com | Auxiliar | Testing de permisos |

## 📚 **Documentación Adicional**

- [Base de Datos](./database/README.md) - Scripts SQL, pgAdmin y datos de prueba
- [Colección Postman](./postman/kustom-api.postman_collection.json) - 80 endpoints documentados
- [Environment Postman](./postman//KUSTOM_API_ENV_POSTMAN.postman_environment.json) - Variables de entorno
