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
asd
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

## Informe de Funcionalidades de la API

Este informe detalla las funcionalidades implementadas en la API, incluyendo la descripción de cada endpoint, sus parámetros y respuestas, así como la implementación de la autenticación, autorización y persistencia.

### Autenticación y Autorización

La API utiliza un esquema de autenticación basado en JSON Web Tokens (JWT).

*   **Autenticación**: El endpoint `POST /auth` permite a los usuarios autenticarse con su email y contraseña. Si las credenciales son válidas, la API retorna un `access_token` JWT. Este token debe ser incluido en la cabecera `Authorization` de las solicitudes a los endpoints protegidos, con el formato `Bearer {access_token}`.

*   **Autorización**: La autorización se implementa a nivel de roles. Existen tres roles definidos: `Coordinador`, `Consultor` y `Auxiliar`. Cada rol tiene asociados una serie de permisos que le permiten o deniegan el acceso a determinados endpoints o acciones. La API utiliza guardas (`guards`) de NestJS para verificar los permisos del usuario en cada solicitud. Los permisos se gestionan a través de los endpoints del módulo `Role Permissions`.

### Persistencia de Datos

La API utiliza dos bases de datos para la persistencia de la información:

*   **PostgreSQL**: Es la base de datos principal, utilizada para almacenar la información de negocio de la aplicación, como usuarios, productos, diseños, órdenes, etc. Se utiliza TypeORM como ORM para interactuar con la base de datos.

*   **MongoDB**: Se utiliza para el módulo de auditoría. Cada acción relevante que ocurre en la API (creación de un usuario, actualización de un producto, etc.) se registra en una colección de MongoDB. Esto permite tener un historial completo de todas las operaciones realizadas en el sistema.

### Descripción de Endpoints

A continuación se describen los principales endpoints de la API, agrupados por módulo.

#### Auth

*   **`POST /auth`**: Autentica a un usuario y retorna un `access_token`.
    *   **Body**: `{ "email": "user@example.com", "password": "user_password" }`
    *   **Respuesta**: `{ "access_token": "jwt_token" }`

#### Users

*   **`GET /users`**: Obtiene una lista de todos los usuarios.
*   **`GET /users/{id}`**: Obtiene un usuario por su ID.
*   **`POST /users`**: Crea un nuevo usuario.
*   **`PUT /users/{id}`**: Actualiza un usuario existente.
*   **`DELETE /users/{id}`**: Elimina un usuario.

#### Categories

*   **`GET /categories`**: Obtiene una lista de todas las categorías de productos.
*   **`GET /categories/{id}`**: Obtiene una categoría por su ID.
*   **`POST /categories`**: Crea una nueva categoría.
*   **`PUT /categories/{id}`**: Actualiza una categoría existente.
*   **`DELETE /categories/{id}`**: Elimina una categoría.

#### Cloths

*   **`GET /cloths`**: Obtiene una lista de todas las prendas base.
*   **`GET /cloths/{id}`**: Obtiene una prenda por su ID.
*   **`POST /cloths`**: Crea una nueva prenda.
*   **`PUT /cloths/{id}`**: Actualiza una prenda existente.
*   **`DELETE /cloths/{id}`**: Elimina una prenda.

#### Designs

*   **`GET /designs`**: Obtiene una lista de todos los diseños.
*   **`GET /designs/{id}`**: Obtiene un diseño por su ID.
*   **`POST /designs`**: Crea un nuevo diseño.
*   **`PUT /designs/{id}`**: Actualiza un diseño existente.
*   **`DELETE /designs/{id}`**: Elimina un diseño.

#### Images

*   **`GET /images`**: Obtiene una lista de todas las imágenes.
*   **`GET /images/{id}`**: Obtiene una imagen por su ID.
*   **`POST /images`**: Sube una nueva imagen.
*   **`PUT /images/{id}`**: Actualiza una imagen existente.
*   **`DELETE /images/{id}`**: Elimina una imagen.

#### Carts

*   **`GET /carts`**: Obtiene el carrito de compras del usuario autenticado.
*   **`GET /carts/{id}`**: Obtiene un carrito por su ID.
*   **`POST /carts`**: Crea un nuevo carrito.
*   **`PUT /carts/{id}`**: Actualiza un carrito existente.
*   **`DELETE /carts/{id}`**: Elimina un carrito.

#### Addresses

*   **`GET /addresses`**: Obtiene las direcciones del usuario autenticado.
*   **`GET /addresses/{id}`**: Obtiene una dirección por su ID.
*   **`POST /addresses`**: Crea una nueva dirección.
*   **`PUT /addresses/{id}`**: Actualiza una dirección existente.
*   **`DELETE /addresses/{id}`**: Elimina una dirección.

#### Cart Design

*   **`GET /cart-design`**: Obtiene los diseños en el carrito del usuario.
*   **`GET /cart-design/{id}`**: Obtiene un diseño del carrito por su ID.
*   **`POST /cart-design`**: Agrega un diseño al carrito.
*   **`PUT /cart-design/{id}`**: Actualiza un diseño en el carrito.
*   **`DELETE /cart-design/{id}`**: Elimina un diseño del carrito.

#### Custom Images

*   **`GET /custom-images`**: Obtiene las imágenes personalizadas de un diseño.
*   **`GET /custom-images/{id}`**: Obtiene una imagen personalizada por su ID.
*   **`POST /custom-images`**: Agrega una imagen personalizada a un diseño.
*   **`PUT /custom-images/{id}`**: Actualiza una imagen personalizada.
*   **`DELETE /custom-images/{id}`**: Elimina una imagen personalizada.

#### Design History

*   **`GET /design-history`**: Obtiene el historial de cambios de un diseño.
*   **`GET /design-history/{id}`**: Obtiene un registro del historial por su ID.
*   **`POST /design-history`**: Crea un nuevo registro en el historial.
*   **`PUT /design-history/{id}`**: Actualiza un registro del historial.
*   **`DELETE /design-history/{id}`**: Elimina un registro del historial.

#### Orders

*   **`GET /orders`**: Obtiene las órdenes del usuario autenticado.
*   **`GET /orders/{id}`**: Obtiene una orden por su ID.
*   **`POST /orders`**: Crea una nueva orden.
*   **`PUT /orders/{id}`**: Actualiza una orden existente.
*   **`DELETE /orders/{id}`**: Elimina una orden.

#### Stocks

*   **`GET /stocks`**: Obtiene el stock de las prendas.
*   **`GET /stocks/{id}`**: Obtiene el stock de una prenda por su ID.
*   **`POST /stocks`**: Crea un nuevo registro de stock.
*   **`PUT /stocks/{id}`**: Actualiza un registro de stock.
*   **`DELETE /stocks/{id}`**: Elimina un registro de stock.

#### Transactions

*   **`GET /transactions`**: Obtiene las transacciones de una orden.
*   **`GET /transactions/{id}`**: Obtiene una transacción por su ID.
*   **`POST /transactions`**: Crea una nueva transacción.
*   **`PUT /transactions/{id}`**: Actualiza una transacción.
*   **`DELETE /transactions/{id}`**: Elimina una transacción.

#### Audit

*   **`GET /audit/logs`**: Obtiene los logs de auditoría.
*   **`GET /audit/user/{id}`**: Obtiene la actividad de un usuario.
*   **`GET /audit/stats`**: Obtiene estadísticas de auditoría.
*   **`GET /audit/resource/{resource}/{id}`**: Obtiene el historial de un recurso.
*   **`DELETE /audit/clean`**: Limpia los logs de auditoría antiguos.

#### Role Permissions

*   **`GET /role-permissions`**: Obtiene todos los permisos de roles.
*   **`GET /role-permissions/by-role/{role}`**: Obtiene los permisos de un rol.
*   **`GET /role-permissions/resources`**: Obtiene los recursos disponibles.
*   **`GET /role-permissions/actions`**: Obtiene las acciones disponibles.
*   **`POST /role-permissions`**: Crea un nuevo permiso de rol.
*   **`POST /role-permissions/check`**: Verifica si un rol tiene un permiso.
*   **`POST /role-permissions/initialize`**: Inicializa los permisos de los roles.
*   **`PUT /role-permissions/{id}`**: Actualiza un permiso de rol.
*   **`DELETE /role-permissions/{id}`**: Elimina un permiso de rol.
