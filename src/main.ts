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
    .setDescription('API documentation for Kustom - Custom Clothing Platform')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'User authentication endpoints')
    .addTag('Users', 'User management')
    .addTag('Cloths', 'Clothing items catalog')
    .addTag('Categories', 'Product categories')
    .addTag('Orders', 'Order management')
    .addTag('Designs', 'Custom designs')
    .addTag('Carts', 'Shopping carts')
    .addTag('Addresses', 'Shipping addresses')
    .addTag('Stocks', 'Inventory management')
    .addTag('Transactions', 'Payment transactions')
    .addTag('Images', 'Design images')
    .addTag('Custom Images', 'User uploaded images')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(3000);

  // @ts-ignore: Webpack HMR
    if ((module as any).hot) {
      (module as any).hot.accept();
      (module as any).hot.dispose(() => app.close());
    }
}
bootstrap();
