import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'verbose', 'debug'],
  });

  await app.listen(3000);
  console.log(`🚀 GraphQL API running on: http://localhost:3000/graphql`);

  // @ts-ignore: Webpack HMR
  if ((module as any).hot) {
    (module as any).hot.accept();
    (module as any).hot.dispose(() => app.close());
  }
}
bootstrap();
