import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule,
    {
      logger: ['error', 'warn', 'log', 'verbose', 'debug'],
    }
  );

  const config = new DocumentBuilder()
    .setTitle('Kustom API')
    .setDescription(`
# Kustom - Custom Clothing Platform API

This is the official API documentation for Kustom, a custom clothing platform that allows users to design and order personalized clothing items.

## Features
- User authentication and authorization with role-based access control (RBAC)
- Custom clothing design creation and management
- Shopping cart and order processing
- Inventory management
- Payment transaction handling
- Image upload and management

## Authentication
Most endpoints require JWT Bearer authentication. To authenticate:
1. Login using the \`/auth/login\` endpoint
2. Use the returned JWT token in the Authorization header: \`Bearer <token>\`

## User Roles
- **Consultor**: Basic user role, can be created without authentication
- **Auxiliar**: Administrative role, requires special permissions to create
- **Coordinador**: Highest administrative role, requires special permissions to create

## API Versioning
Current version: 1.0.0
    `)
    .setVersion('1.0.0')
    .setContact(
      'Kustom Support',
      'https://kustom.com',
      'support@kustom.com'
    )
    .setLicense(
      'MIT',
      'https://opensource.org/licenses/MIT'
    )
    .addServer('http://localhost:3000', 'Development server')
    .addServer('https://api.kustom.com', 'Production server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management and registration')
    .addTag('Cloths', 'Clothing items catalog and management')
    .addTag('Categories', 'Product category management')
    .addTag('Orders', 'Order creation and management')
    .addTag('Designs', 'Custom design creation and management')
    .addTag('Carts', 'Shopping cart operations')
    .addTag('Addresses', 'Shipping address management')
    .addTag('Stocks', 'Inventory and stock management')
    .addTag('Transactions', 'Payment transaction processing')
    .addTag('Images', 'Design image management')
    .addTag('Custom Images', 'User uploaded custom images')
    .addTag('Permissions', 'Role-based permissions management')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Setup Swagger UI
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Kustom API Documentation',
    customfavIcon: 'https://kustom.com/favicon.ico',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Add endpoints to download OpenAPI specification
  const express = app.getHttpAdapter().getInstance();

  // JSON format
  express.get('/api-spec.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=openapi-spec.json');
    res.send(document);
  });

  // YAML format (requires js-yaml package)
  express.get('/api-spec.yaml', async (req, res) => {
    try {
      const yaml = require('js-yaml');
      const yamlDoc = yaml.dump(document, { lineWidth: -1 });
      res.setHeader('Content-Type', 'application/x-yaml');
      res.setHeader('Content-Disposition', 'attachment; filename=openapi-spec.yaml');
      res.send(yamlDoc);
    } catch (error) {
      console.error('Error generating YAML:', error);
      res.status(500).json({
        error: 'Failed to generate YAML. Install js-yaml: npm install js-yaml'
      });
    }
  });

  // Endpoint to view the specification in the browser
  express.get('/api-spec', (req, res) => {
    res.json(document);
  });

  console.log('OpenAPI Specification available at:');
  console.log('  - Swagger UI: http://localhost:3000/api');
  console.log('  - JSON Spec: http://localhost:3000/api-spec.json');
  console.log('  - YAML Spec: http://localhost:3000/api-spec.yaml');
  console.log('  - View Spec: http://localhost:3000/api-spec');

  await app.listen(3000);

  // @ts-ignore: Webpack HMR
    if ((module as any).hot) {
      (module as any).hot.accept();
      (module as any).hot.dispose(() => app.close());
    }
}
bootstrap();
