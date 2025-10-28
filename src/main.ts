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
    .setTitle('Swagger')
    .setDescription('Api docs')
    .setVersion('1.0')
    .addBearerAuth()
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
