# 🚀 Guía de Configuración - Kustom API

Esta guía te ayudará a configurar el entorno de desarrollo completo para la API de Kustom.

## 📋 Tabla de Contenidos

1. [Prerequisitos](#prerequisitos)
2. [Instalación Paso a Paso](#instalación-paso-a-paso)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Testing con Postman](#testing-con-postman)
5. [Verificación](#verificación)
6. [Solución de Problemas](#solución-de-problemas)

## 🔧 Prerequisitos

Asegúrate de tener instalado:

- ✅ **Node.js** 18 o superior ([Descargar](https://nodejs.org/))
- ✅ **Docker** & **Docker Compose** ([Descargar](https://www.docker.com/products/docker-desktop))
- ✅ **Git** ([Descargar](https://git-scm.com/downloads))
- ✅ **Postman** (opcional) ([Descargar](https://www.postman.com/downloads/))

### Verificar Instalación

```bash
node --version    # v18.0.0 o superior
npm --version     # 8.0.0 o superior
docker --version  # 20.0.0 o superior
docker-compose --version  # 1.29.0 o superior
```

## 📦 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd backend-nestjs
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.docker.example .env
```

Edita `.env` según tus necesidades:

```env
# PostgreSQL
DB_HOST=localhost
DB_USER=postgres
DB_PASS=postgres
DB_NAME=app_db
DB_PORT=5432

# MongoDB
MONGO_DB=kustom_audit
MONGO_PORT=27017

# pgAdmin
PGADMIN_EMAIL=admin@kustom.com
PGADMIN_PASSWORD=admin123
PGADMIN_PORT=5050

# API (agrega estas si no existen)
JWT_SECRET=tu-secreto-super-seguro-cambiame
API_PORT=3000
```


## 🗄️ Configuración de Base de Datos

### 1. Levantar Servicios Docker

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- MongoDB (puerto 27017)
- pgAdmin (puerto 5050)

### 2. Verificar que los Servicios Están Corriendo

```bash
docker-compose ps
```

Deberías ver:

```
NAME                 STATUS          PORTS
kustom_postgres      Up              0.0.0.0:5432->5432/tcp
kustom_mongo         Up              0.0.0.0:27017->27017/tcp
kustom_pgadmin       Up              0.0.0.0:5050->80/tcp
```

### 3. Iniciar la Aplicación (Para Crear Tablas)

La aplicación debe iniciarse primero para que TypeORM cree las tablas automáticamente:

```bash
npm run start:dev
```

Espera unos segundos hasta que veas el mensaje: `Nest application successfully started`

### 4. Ejecutar el Seeding de Datos

**En otra terminal**, ejecuta el comando de seeding para insertar los datos iniciales:

```bash
npm run seed
```

Deberías ver mensajes indicando que se están creando los datos:

```
🌱 Starting database seeding...
👥 Seeding users...
  ✓ Created 5 users
📁 Seeding categories...
  ✓ Created 5 categories
...
✅ Database seeding completed successfully!
```

> **Nota**: El seeding solo se ejecuta una vez. Si intentas ejecutarlo nuevamente, verá un mensaje indicando que los datos ya existen.

### 4. Explorar con pgAdmin (Opcional)

1. Abre tu navegador en: http://localhost:5050
2. Inicia sesión:
   - **Email**: admin@kustom.com
   - **Contraseña**: admin123
3. Conecta al servidor PostgreSQL:
   - Click derecho en "Servers" → "Register" → "Server"
   - **General Tab**:
     - Name: `Kustom DB`
   - **Connection Tab**:
     - Host: `postgres` (nombre del servicio en Docker)
     - Port: `5432`
     - Database: `app_db`
     - Username: `postgres`
     - Password: `postgres`

## 🚀 Verificar la API

La API ya debería estar corriendo desde el paso anterior. Verifica que responde correctamente:

```bash
curl http://localhost:3000
```

La API está disponible en: http://localhost:3000

## 📮 Testing con Postman

### 1. Importar Colección

1. Abre Postman
2. Click en "Import"
3. Selecciona `kustom-api.postman_collection.json`
4. La colección "kustom-api" aparecerá en tu workspace

### 2. Importar Environment

1. En Postman, ve a "Environments"
2. Click en "Import"
3. Selecciona `KUSTOM_API_ENV_POSTMAN.postman_environment.json`
4. Activa el environment "KUSTOM_API_ENV_POSTMAN"

### 3. Ejecutar tu Primera Prueba

1. En la colección, abre: **Auth → Post auth**
2. Click en "Send"
3. Deberías recibir una respuesta con un `access_token`
4. El token se guardará automáticamente en las variables de entorno

### 4. Probar Otros Endpoints

Ahora puedes probar cualquier endpoint. Todos usan el token automáticamente:

- **Users → Get users**: Listar usuarios
- **Categories → Get categories**: Listar categorías
- **Cloths → Get cloths**: Listar prendas

### 5. Ejecutar Collection Runner (Opcional)

Para ejecutar todas las pruebas de forma automática:

1. Click derecho en la colección "kustom-api"
2. Selecciona "Run collection"
3. Asegúrate de tener seleccionado el environment
4. Click en "Run kustom-api"

## ✅ Verificación

### Checklist de Verificación

- [ ] Docker services están corriendo (`docker-compose ps`)
- [ ] PostgreSQL tiene datos iniciales
- [ ] MongoDB está accesible
- [ ] pgAdmin se puede acceder en http://localhost:5050
- [ ] API responde en http://localhost:3000
- [ ] Autenticación funciona con usuario de prueba
- [ ] Postman puede conectarse a la API

### Pruebas Rápidas

```bash
# Verificar PostgreSQL
docker exec -it kustom_postgres psql -U postgres -d app_db -c "SELECT COUNT(*) FROM \"user\";"

# Verificar MongoDB
docker exec -it kustom_mongo mongosh --eval "db.version()"

# Verificar API
curl -X POST http://localhost:3000/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"raul@admin.com","password":"1234"}'
```

## 🐛 Solución de Problemas

### Error: "Puerto ya en uso"

```bash
# Ver qué proceso usa el puerto
lsof -i :5432  # PostgreSQL
lsof -i :27017 # MongoDB
lsof -i :5050  # pgAdmin
lsof -i :3000  # API

# Detener Docker Compose y volver a iniciar
docker-compose down
docker-compose up -d
```

### Error: "No se pueden cargar los datos iniciales"

```bash
# Verificar que la aplicación esté corriendo y las tablas creadas
docker exec -it kustom_postgres psql -U postgres -d app_db -c "\dt"

# Si las tablas no existen, inicia la aplicación
npm run start:dev

# Luego ejecuta el seeding
npm run seed

# Si necesitas reiniciar desde cero
docker-compose down
docker volume rm backend_nest_postgres_data
docker-compose up -d
npm run start:dev  # Espera a que se creen las tablas
npm run seed       # En otra terminal
```

### Error: "Contraseña incorrecta en pgAdmin"

Si no puedes conectarte a PostgreSQL desde pgAdmin:

1. Verifica que uses `postgres` como host (no `localhost`)
2. Usa las credenciales del archivo `.env`
3. El puerto debe ser `5432`

### Error: "No puedo autenticarme con la API"

Si la autenticación falla:

1. Verifica que el seeding se haya ejecutado correctamente:
   ```bash
   docker exec -it kustom_postgres psql -U postgres -d app_db -c "SELECT email FROM \"user\";"
   ```
2. Si no hay usuarios, ejecuta el seeding:
   ```bash
   npm run seed
   ```
3. Si necesitas reiniciar completamente:
   ```bash
   docker-compose down
   docker volume rm backend_nest_postgres_data
   docker-compose up -d
   npm run start:dev  # Espera a que inicie
   npm run seed       # En otra terminal
   ```

### Ver Logs Detallados

```bash
# Todos los servicios
docker-compose logs -f

# Solo PostgreSQL
docker logs -f kustom_postgres

# Solo la API (si está en Docker)
npm run start:dev  # Ver en consola
```

## 📚 Próximos Pasos

Una vez que tengas todo funcionando:

1. **Explorar la API**: Revisa todos los endpoints en Postman
2. **Leer la Documentación**: Consulta [database/README.md](./database/README.md)
3. **Ejecutar Tests**: `npm run test:unit`
4. **Desarrollar Features**: Comienza a desarrollar nuevas funcionalidades

## 🤝 Soporte

Si tienes problemas:

1. Revisa esta guía completamente
2. Consulta [database/README.md](./database/README.md)
3. Revisa los logs con `docker-compose logs -f`
4. Busca en los issues del repositorio
5. Crea un nuevo issue si el problema persiste

## 🎉 ¡Listo!

Si llegaste hasta aquí y todo funciona, ¡felicidades! 🎊

Tu entorno de desarrollo está completamente configurado y listo para usar.

Happy coding! 💻✨
