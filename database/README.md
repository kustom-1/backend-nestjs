# 🗄️ Base de Datos - Kustom API

Este directorio contiene la configuración y scripts relacionados con la base de datos.

## 📁 Estructura

```
database/
├── pgadmin-servers.json           # Configuración de servidores para pgAdmin
├── generate-password-hashes.js    # Script legado (ya no necesario)
└── README.md                      # Este archivo
```

> **Nota**: El seeding de datos ahora se maneja desde NestJS, no desde scripts SQL.

## 🚀 Inicio Rápido

### 1. Levantar los Contenedores

```bash
# Desde la raíz del proyecto
docker-compose up -d
```

Esto iniciará PostgreSQL, MongoDB y pgAdmin.

### 2. Iniciar la Aplicación (Para Crear Tablas)

TypeORM creará las tablas automáticamente cuando la aplicación se inicie:

```bash
npm run start:dev
```

Espera unos segundos hasta que veas: `Nest application successfully started`

### 3. Ejecutar el Seeding

**En otra terminal**, ejecuta el comando de seeding para insertar los datos iniciales:

```bash
npm run seed
```

### 4. Verificar que los Datos se Cargaron

```bash
# Conectarse a PostgreSQL
docker exec -it kustom_postgres psql -U postgres -d app_db

# Ver tablas
\dt

# Ver usuarios de ejemplo
SELECT id, email, role FROM "user";

# Salir
\q
```

## 🔐 Usuarios de Prueba

Todos los usuarios tienen la contraseña: **`1234`**

| Email | Rol | Descripción |
|-------|-----|-------------|
| admin@kustom.com | Coordinador | Usuario administrador del sistema |
| raul@admin.com | Coordinador | Usuario coordinador (usado en Postman) |
| carlos@consultor.com | Consultor | Usuario consultor de prueba |
| maria@auxiliar.com | Auxiliar | Usuario auxiliar de prueba |
| juan@kustom.com | Consultor | Usuario consultor adicional |

## 🎨 pgAdmin

pgAdmin está incluido para administrar PostgreSQL visualmente.

### Acceso

- **URL**: http://localhost:5050
- **Email**: admin@kustom.com
- **Contraseña**: admin123

### Conectarse al Servidor

El servidor PostgreSQL ya está pre-configurado. Solo necesitas ingresar la contraseña al conectarte por primera vez:

- **Contraseña del servidor PostgreSQL**: `postgres` (o la que hayas configurado en `.env`)

## 📊 Datos Iniciales

El script de inicialización crea:

- **5 Usuarios** (con diferentes roles)
- **5 Categorías** de productos
- **7 Prendas** (cloths) variadas
- **7 Imágenes** de ejemplo
- **5 Diseños** de usuarios
- **2 Carritos** de compra
- **3 Direcciones** de envío
- **3 Diseños en carritos**
- **4 Imágenes personalizadas** en diseños
- **4 Versiones** de historial de diseños
- **12 Registros de stock** (inventario)
- **3 Órdenes** de ejemplo
- **3 Transacciones** completadas
- **39 Permisos de roles** configurados

## 🔄 Reinicializar la Base de Datos

Si necesitas reiniciar desde cero:

```bash
# Detener y eliminar los contenedores
docker-compose down

# Eliminar volúmenes (¡CUIDADO! Esto borra todos los datos)
docker volume rm backend_nest_postgres_data
docker volume rm backend_nest_pgadmin_data

# Volver a levantar
docker-compose up -d

# Iniciar la aplicación para crear las tablas
npm run start:dev

# En otra terminal, ejecutar el seeding
npm run seed
```

## 🔧 Personalización

### Modificar Datos Iniciales

Para modificar los datos iniciales, edita el archivo `src/database/database-seeder.service.ts` y luego ejecuta:

```bash
npm run seed
```

### Cambiar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASS=tu_password_seguro
DB_NAME=app_db
DB_PORT=5432

PGADMIN_EMAIL=tu@email.com
PGADMIN_PASSWORD=tu_password_pgadmin
PGADMIN_PORT=5050
```

## 📝 Notas Importantes

1. **Seeding con TypeORM**: El seeding ahora se realiza desde NestJS usando TypeORM, lo que garantiza compatibilidad con las entidades y relaciones del proyecto.

2. **Hashes de Contraseñas**: El seeder genera automáticamente hashes de bcrypt seguros para la contraseña "1234" al ejecutarse.

3. **Idempotencia**: El seeding verifica si ya existen datos antes de insertarlos. Si la base de datos ya tiene usuarios, no se ejecutará nuevamente.

4. **Orden de Inserción**: El seeder respeta las dependencias entre entidades, creando primero las entidades padre y luego las hijas.

## 🐛 Solución de Problemas

### El seeding falla

```bash
# Verificar que la aplicación esté corriendo
# (Las tablas deben existir primero)
npm run start:dev

# En otra terminal, intentar el seeding nuevamente
npm run seed

# Si el error persiste, verificar la conexión a la base de datos
docker exec -it kustom_postgres psql -U postgres -d app_db -c "\dt"
```

### No puedo conectarme a pgAdmin

```bash
# Verificar que pgAdmin está corriendo
docker ps | grep pgadmin

# Ver logs de pgAdmin
docker logs kustom_pgadmin

# Verificar el puerto
curl http://localhost:5050
```

### Error de permisos en pgAdmin

```bash
# Cambiar permisos del directorio de configuración
sudo chown -R 5050:5050 database/
```

## 📚 Recursos Adicionales

- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [Documentación de pgAdmin](https://www.pgadmin.org/docs/)
- [Docker PostgreSQL Official Image](https://hub.docker.com/_/postgres)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🤝 Contribuir

Si encuentras problemas o tienes sugerencias para mejorar los scripts de inicialización, por favor crea un issue o pull request.
