-- ==================================================
-- KUSTOM API - Script de Inicialización de Datos
-- ==================================================
-- Este script crea datos iniciales para la base de datos
-- Compatible con las pruebas de Postman
-- ==================================================

-- Eliminar datos existentes (en orden inverso de dependencias)
TRUNCATE TABLE "transaction" CASCADE;
TRUNCATE TABLE "stock" CASCADE;
TRUNCATE TABLE "order" CASCADE;
TRUNCATE TABLE "design_history" CASCADE;
TRUNCATE TABLE "custom_image" CASCADE;
TRUNCATE TABLE "cart_design" CASCADE;
TRUNCATE TABLE "design" CASCADE;
TRUNCATE TABLE "image" CASCADE;
TRUNCATE TABLE "cloth" CASCADE;
TRUNCATE TABLE "cart" CASCADE;
TRUNCATE TABLE "address" CASCADE;
TRUNCATE TABLE "categories" CASCADE;
TRUNCATE TABLE "user" CASCADE;
TRUNCATE TABLE "role_permission" CASCADE;

-- Reiniciar secuencias
ALTER SEQUENCE "user_id_seq" RESTART WITH 1;
ALTER SEQUENCE "categories_id_seq" RESTART WITH 1;
ALTER SEQUENCE "cloth_id_seq" RESTART WITH 1;
ALTER SEQUENCE "image_id_seq" RESTART WITH 1;
ALTER SEQUENCE "design_id_seq" RESTART WITH 1;
ALTER SEQUENCE "cart_id_seq" RESTART WITH 1;
ALTER SEQUENCE "address_id_seq" RESTART WITH 1;
ALTER SEQUENCE "cart_design_id_seq" RESTART WITH 1;
ALTER SEQUENCE "custom_image_id_seq" RESTART WITH 1;
ALTER SEQUENCE "design_history_id_seq" RESTART WITH 1;
ALTER SEQUENCE "order_id_seq" RESTART WITH 1;
ALTER SEQUENCE "stock_id_seq" RESTART WITH 1;
ALTER SEQUENCE "transaction_id_seq" RESTART WITH 1;
ALTER SEQUENCE "role_permission_id_seq" RESTART WITH 1;

-- ==================================================
-- USUARIOS
-- ==================================================
-- Contraseña para todos los usuarios: "1234"
-- Hash generado con bcrypt (salt rounds: 10)

INSERT INTO "user" (id, "firstName", "lastName", email, "isActive", password, role) VALUES
(1, 'Admin', 'Sistema', 'admin@kustom.com', true, '$2b$10$rZ8qKQqJqKqJqKqJqKqJqOqJqKqJqKqJqKqJqKqJqKqJqKqJqKqJq', 'Coordinador'),
(2, 'Raul', 'Admin', 'raul@admin.com', true, '$2b$10$rZ8qKQqJqKqJqKqJqKqJqOqJqKqJqKqJqKqJqKqJqKqJqKqJqKqJq', 'Coordinador'),
(3, 'Carlos', 'Consultor', 'carlos@consultor.com', true, '$2b$10$rZ8qKQqJqKqJqKqJqKqJqOqJqKqJqKqJqKqJqKqJqKqJqKqJqKqJq', 'Consultor'),
(4, 'María', 'Auxiliar', 'maria@auxiliar.com', true, '$2b$10$rZ8qKQqJqKqJqKqJqKqJqOqJqKqJqKqJqKqJqKqJqKqJqKqJqKqJq', 'Auxiliar'),
(5, 'Juan', 'Pérez', 'juan@kustom.com', true, '$2b$10$rZ8qKQqJqKqJqKqJqKqJqOqJqKqJqKqJqKqJqKqJqKqJqKqJqKqJq', 'Consultor');

SELECT setval('"user_id_seq"', 5, true);

-- ==================================================
-- CATEGORÍAS
-- ==================================================

INSERT INTO categories (id, name, description) VALUES
(1, 'Camisetas', 'Camisetas personalizables de diferentes estilos'),
(2, 'Hoodies', 'Sudaderas con capucha personalizables'),
(3, 'Pantalones', 'Pantalones y joggers personalizables'),
(4, 'Accesorios', 'Gorras, bolsas y otros accesorios'),
(5, 'Edición Especial', 'Productos de edición limitada');

SELECT setval('categories_id_seq', 5, true);

-- ==================================================
-- PRENDAS (CLOTHS)
-- ==================================================

INSERT INTO "cloth" (id, base_price, stock, description, category, model_url, name) VALUES
(1, 19.99, 100, 'Camiseta básica de algodón 100%, ideal para personalización', 1, 'https://example.com/models/basic-tshirt.glb', 'Camiseta Básica'),
(2, 24.99, 75, 'Camiseta premium con tejido suave y duradero', 1, 'https://example.com/models/premium-tshirt.glb', 'Camiseta Premium'),
(3, 39.99, 50, 'Hoodie clásico con bolsillo canguro', 2, 'https://example.com/models/classic-hoodie.glb', 'Hoodie Clásico'),
(4, 44.99, 40, 'Hoodie con zipper y capucha ajustable', 2, 'https://example.com/models/zip-hoodie.glb', 'Hoodie Zipper'),
(5, 34.99, 60, 'Joggers deportivos con ajuste cómodo', 3, 'https://example.com/models/joggers.glb', 'Joggers Deportivos'),
(6, 15.99, 120, 'Gorra snapback personalizable', 4, 'https://example.com/models/snapback.glb', 'Gorra Snapback'),
(7, 29.99, 30, 'Camiseta edición limitada 2024', 1, 'https://example.com/models/limited-tshirt.glb', 'Limited Edition 2024');

SELECT setval('"cloth_id_seq"', 7, true);

-- ==================================================
-- IMÁGENES
-- ==================================================

INSERT INTO "image" (id, url, "user", tags, "isPublic") VALUES
(1, 'https://example.com/images/logo-kustom.png', 2, '["logo", "brand"]', true),
(2, 'https://example.com/images/design-abstract-1.png', 3, '["abstract", "art"]', true),
(3, 'https://example.com/images/design-geometric.png', 3, '["geometric", "modern"]', true),
(4, 'https://example.com/images/design-nature.png', 5, '["nature", "organic"]', true),
(5, 'https://example.com/images/design-urban.png', 3, '["urban", "street"]', false),
(6, 'https://example.com/images/pattern-stripes.png', 2, '["pattern", "stripes"]', true),
(7, 'https://example.com/images/typography-bold.png', 5, '["typography", "bold"]', true);

SELECT setval('"image_id_seq"', 7, true);

-- ==================================================
-- DISEÑOS
-- ==================================================

INSERT INTO "design" (id, "user", cloth, "isPublic", "isActive") VALUES
(1, 3, 1, true, true),
(2, 3, 2, true, true),
(3, 5, 3, true, true),
(4, 3, 1, false, true),
(5, 5, 4, true, true);

SELECT setval('"design_id_seq"', 5, true);

-- ==================================================
-- CARRITOS
-- ==================================================

INSERT INTO "cart" (id, "user") VALUES
(1, 3),
(2, 5);

SELECT setval('"cart_id_seq"', 2, true);

-- ==================================================
-- DIRECCIONES
-- ==================================================

INSERT INTO "address" (id, "user", street, city, state, "postalCode", country) VALUES
(1, 3, 'Calle Principal 123', 'Bogotá', 'Cundinamarca', '110111', 'Colombia'),
(2, 5, 'Avenida Libertador 456', 'Medellín', 'Antioquia', '050001', 'Colombia'),
(3, 2, 'Carrera 7 #32-10', 'Bogotá', 'Cundinamarca', '110231', 'Colombia');

SELECT setval('"address_id_seq"', 3, true);

-- ==================================================
-- CART DESIGNS (Diseños en Carritos)
-- ==================================================

INSERT INTO "cart_design" (id, design, cart, quantity, subtotal) VALUES
(1, 1, 1, 2, 39.98),
(2, 3, 1, 1, 39.99),
(3, 5, 2, 3, 134.97);

SELECT setval('"cart_design_id_seq"', 3, true);

-- ==================================================
-- CUSTOM IMAGES (Imágenes Personalizadas en Diseños)
-- ==================================================

INSERT INTO "custom_image" (id, image, config, design) VALUES
(1, 1, '{"position": {"x": 100, "y": 150}, "scale": 1.2, "rotation": 0}', 1),
(2, 2, '{"position": {"x": 200, "y": 200}, "scale": 1.5, "rotation": 45}', 1),
(3, 3, '{"position": {"x": 150, "y": 100}, "scale": 1.0, "rotation": 0}', 2),
(4, 4, '{"position": {"x": 180, "y": 180}, "scale": 1.8, "rotation": 90}', 3);

SELECT setval('"custom_image_id_seq"', 4, true);

-- ==================================================
-- DESIGN HISTORY (Historial de Versiones de Diseños)
-- ==================================================

INSERT INTO "design_history" (id, design, version, snapshot) VALUES
(1, 1, 1, '{"timestamp": "2024-01-15T10:30:00Z", "images": [1], "changes": "Initial design"}'),
(2, 1, 2, '{"timestamp": "2024-01-15T11:45:00Z", "images": [1, 2], "changes": "Added abstract image"}'),
(3, 2, 1, '{"timestamp": "2024-01-16T09:00:00Z", "images": [3], "changes": "Initial design"}'),
(4, 3, 1, '{"timestamp": "2024-01-17T14:20:00Z", "images": [4], "changes": "Initial design"}');

SELECT setval('"design_history_id_seq"', 4, true);

-- ==================================================
-- INVENTARIO (STOCKS)
-- ==================================================

INSERT INTO "stock" (id, gender, color, size, stock, cloth) VALUES
-- Camiseta Básica (ID: 1)
(1, 'unisex', 'white', 'S', 25, 1),
(2, 'unisex', 'white', 'M', 30, 1),
(3, 'unisex', 'white', 'L', 25, 1),
(4, 'unisex', 'black', 'M', 20, 1),
-- Camiseta Premium (ID: 2)
(5, 'unisex', 'navy', 'M', 20, 2),
(6, 'unisex', 'navy', 'L', 15, 2),
-- Hoodie Clásico (ID: 3)
(7, 'unisex', 'gray', 'M', 15, 3),
(8, 'unisex', 'gray', 'L', 15, 3),
(9, 'unisex', 'black', 'M', 10, 3),
-- Hoodie Zipper (ID: 4)
(10, 'unisex', 'black', 'L', 10, 4),
-- Joggers (ID: 5)
(11, 'unisex', 'black', 'M', 20, 5),
(12, 'unisex', 'gray', 'L', 20, 5);

SELECT setval('"stock_id_seq"', 12, true);

-- ==================================================
-- ÓRDENES
-- ==================================================

INSERT INTO "order" (id, quantity, "user", date, status, address) VALUES
(1, 2, 3, '2024-01-20T10:00:00Z', 'completed', 1),
(2, 1, 5, '2024-01-21T15:30:00Z', 'pending', 2),
(3, 3, 3, '2024-01-22T09:15:00Z', 'processing', 1);

SELECT setval('"order_id_seq"', 3, true);

-- ==================================================
-- TRANSACCIONES
-- ==================================================

INSERT INTO "transaction" (id, "order", amount, method, status, "transactionDate") VALUES
(1, 1, 79.98, 'credit_card', 'completed', '2024-01-20T10:05:00Z'),
(2, 2, 39.99, 'paypal', 'pending', '2024-01-21T15:35:00Z'),
(3, 3, 134.97, 'credit_card', 'completed', '2024-01-22T09:20:00Z');

SELECT setval('"transaction_id_seq"', 3, true);

-- ==================================================
-- PERMISOS POR ROL (ROLE PERMISSIONS)
-- ==================================================

-- Permisos para COORDINADOR (acceso total)
INSERT INTO "role_permission" (id, role, resource, action, description, conditions, "isActive") VALUES
-- Users
(1, 'Coordinador', 'users', 'create', 'Crear usuarios', '{}', true),
(2, 'Coordinador', 'users', 'read', 'Ver usuarios', '{}', true),
(3, 'Coordinador', 'users', 'update', 'Actualizar usuarios', '{}', true),
(4, 'Coordinador', 'users', 'delete', 'Eliminar usuarios', '{}', true),
-- Categories
(5, 'Coordinador', 'categories', 'create', 'Crear categorías', '{}', true),
(6, 'Coordinador', 'categories', 'read', 'Ver categorías', '{}', true),
(7, 'Coordinador', 'categories', 'update', 'Actualizar categorías', '{}', true),
(8, 'Coordinador', 'categories', 'delete', 'Eliminar categorías', '{}', true),
-- Cloths
(9, 'Coordinador', 'cloths', 'create', 'Crear prendas', '{}', true),
(10, 'Coordinador', 'cloths', 'read', 'Ver prendas', '{}', true),
(11, 'Coordinador', 'cloths', 'update', 'Actualizar prendas', '{}', true),
(12, 'Coordinador', 'cloths', 'delete', 'Eliminar prendas', '{}', true),
-- Designs
(13, 'Coordinador', 'designs', 'create', 'Crear diseños', '{}', true),
(14, 'Coordinador', 'designs', 'read', 'Ver diseños', '{}', true),
(15, 'Coordinador', 'designs', 'update', 'Actualizar diseños', '{}', true),
(16, 'Coordinador', 'designs', 'delete', 'Eliminar diseños', '{}', true),
-- Images
(17, 'Coordinador', 'images', 'create', 'Crear imágenes', '{}', true),
(18, 'Coordinador', 'images', 'read', 'Ver imágenes', '{}', true),
(19, 'Coordinador', 'images', 'update', 'Actualizar imágenes', '{}', true),
(20, 'Coordinador', 'images', 'delete', 'Eliminar imágenes', '{}', true),
-- Orders
(21, 'Coordinador', 'order', 'read', 'Ver órdenes', '{}', true),
(22, 'Coordinador', 'order', 'update', 'Actualizar órdenes', '{}', true),
-- Permisos para AUXILIAR (acceso medio)
(23, 'Auxiliar', 'categories', 'read', 'Ver categorías', '{}', true),
(24, 'Auxiliar', 'cloths', 'read', 'Ver prendas', '{}', true),
(25, 'Auxiliar', 'cloths', 'update', 'Actualizar stock de prendas', '{}', true),
(26, 'Auxiliar', 'designs', 'read', 'Ver diseños', '{}', true),
(27, 'Auxiliar', 'images', 'read', 'Ver imágenes', '{}', true),
(28, 'Auxiliar', 'order', 'read', 'Ver órdenes', '{}', true),
(29, 'Auxiliar', 'order', 'update', 'Actualizar estado de órdenes', '{}', true),
-- Permisos para CONSULTOR (acceso limitado)
(30, 'Consultor', 'categories', 'read', 'Ver categorías', '{}', true),
(31, 'Consultor', 'cloths', 'read', 'Ver prendas', '{}', true),
(32, 'Consultor', 'designs', 'create', 'Crear diseños propios', '{}', true),
(33, 'Consultor', 'designs', 'read', 'Ver diseños', '{}', true),
(34, 'Consultor', 'designs', 'update', 'Actualizar diseños propios', '{"owner": true}', true),
(35, 'Consultor', 'images', 'create', 'Crear imágenes', '{}', true),
(36, 'Consultor', 'images', 'read', 'Ver imágenes', '{}', true),
(37, 'Consultor', 'carts', 'create', 'Crear carrito', '{}', true),
(38, 'Consultor', 'carts', 'read', 'Ver carrito propio', '{"owner": true}', true),
(39, 'Consultor', 'carts', 'update', 'Actualizar carrito propio', '{"owner": true}', true);

SELECT setval('"role_permission_id_seq"', 39, true);

-- ==================================================
-- VERIFICACIÓN DE DATOS
-- ==================================================

-- Mostrar resumen de datos insertados
SELECT 'RESUMEN DE DATOS INICIALES' as title;
SELECT 'Usuarios' as table_name, COUNT(*) as count FROM "user"
UNION ALL SELECT 'Categorías', COUNT(*) FROM categories
UNION ALL SELECT 'Prendas', COUNT(*) FROM "cloth"
UNION ALL SELECT 'Imágenes', COUNT(*) FROM "image"
UNION ALL SELECT 'Diseños', COUNT(*) FROM "design"
UNION ALL SELECT 'Carritos', COUNT(*) FROM "cart"
UNION ALL SELECT 'Direcciones', COUNT(*) FROM "address"
UNION ALL SELECT 'Diseños en Carrito', COUNT(*) FROM "cart_design"
UNION ALL SELECT 'Imágenes Personalizadas', COUNT(*) FROM "custom_image"
UNION ALL SELECT 'Historial de Diseños', COUNT(*) FROM "design_history"
UNION ALL SELECT 'Stock', COUNT(*) FROM "stock"
UNION ALL SELECT 'Órdenes', COUNT(*) FROM "order"
UNION ALL SELECT 'Transacciones', COUNT(*) FROM "transaction"
UNION ALL SELECT 'Permisos de Rol', COUNT(*) FROM "role_permission";

-- ==================================================
-- INFORMACIÓN IMPORTANTE
-- ==================================================
--
-- Usuarios de prueba (todos con contraseña "1234"):
-- - admin@kustom.com (Coordinador)
-- - raul@admin.com (Coordinador)
-- - carlos@consultor.com (Consultor)
-- - maria@auxiliar.com (Auxiliar)
-- - juan@kustom.com (Consultor)
--
-- NOTA IMPORTANTE: Los hashes de contraseña en este script son
-- placeholders. Para seguridad, debes reemplazarlos con hashes
-- reales generados con bcrypt o usar la API para crear usuarios.
--
-- ==================================================
