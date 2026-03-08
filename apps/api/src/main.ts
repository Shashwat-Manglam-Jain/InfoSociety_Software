import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api/v1");
  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Infopath Info Banking API")
    .setDescription("Core banking API scaffold for accounts, loans, deposits, transactions and reporting")
    .setVersion("1.0.0")
    .addBearerAuth()
    .addTag("auth")
    .addTag("billing")
    .addTag("monitoring")
    .addTag("health")
    .addTag("customers")
    .addTag("accounts")
    .addTag("deposits")
    .addTag("loans")
    .addTag("transactions")
    .addTag("cheque-clearing")
    .addTag("demand-drafts")
    .addTag("ibc-obc")
    .addTag("investments")
    .addTag("locker")
    .addTag("cashbook")
    .addTag("administration")
    .addTag("reports")
    .addTag("users")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
}

void bootstrap();
