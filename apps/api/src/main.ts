import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { applyRequestRuntime } from "./common/http/request-runtime";
import { AppModule } from "./app/app.module";

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/+$/, "");
}

function parsePort(value: string | undefined) {
  const parsed = Number(value ?? "4000");
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 4000;
}

function resolveAllowedOrigins(configService: ConfigService) {
  const configuredOrigins = configService.get<string>("CORS_ALLOWED_ORIGINS") ?? "";
  const siteUrl = configService.get<string>("NEXT_PUBLIC_SITE_URL") ?? "";

  return new Set(
    [configuredOrigins, siteUrl, "http://localhost:3000", "http://127.0.0.1:3000"]
      .flatMap((value) => value.split(","))
      .map((value) => normalizeOrigin(value))
      .filter(Boolean)
  );
}

function isSwaggerEnabled(configService: ConfigService) {
  const nodeEnv = configService.get<string>("NODE_ENV") ?? "development";
  const configured = (configService.get<string>("ENABLE_SWAGGER") ?? "").toLowerCase();

  if (configured) {
    return configured === "true" || configured === "1";
  }

  return nodeEnv !== "production";
}

async function setupSwagger(app: Awaited<ReturnType<typeof NestFactory.create>>, configService: ConfigService) {
  if (!isSwaggerEnabled(configService)) {
    return;
  }

  const { DocumentBuilder, SwaggerModule } = await import("@nestjs/swagger");
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Infopath Info Banking API")
    .setDescription("Core banking API scaffold for accounts, loans, deposits, transactions and reporting")
    .setVersion("1.0.0")
    .addBearerAuth()
    .addTag("auth")
    .addTag("billing")
    .addTag("payments")
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
    .addTag("share-capital")
    .addTag("dividends")
    .addTag("financial-years")
    .addTag("interest-slabs")
    .addTag("standing-instructions")
    .addTag("loan-notices")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap");
  const allowedOrigins = resolveAllowedOrigins(configService);
  const expressApp = app.getHttpAdapter().getInstance();

  app.enableShutdownHooks();

  app.setGlobalPrefix("api/v1");
  expressApp.disable("x-powered-by");
  applyRequestRuntime(expressApp, configService, logger);
  expressApp.use((_req: unknown, res: { setHeader(name: string, value: string): void }, next: () => void) => {
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    next();
  });
  app.enableCors({
    origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.has(normalizeOrigin(origin))) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true
      },
      stopAtFirstError: true
    })
  );

  await setupSwagger(app, configService);

  const port = parsePort(configService.get<string>("PORT"));
  await app.listen(port, "0.0.0.0");
  logger.log(`API listening on ${await app.getUrl()}`);
  logger.log(`Allowed CORS origins: ${Array.from(allowedOrigins).join(", ")}`);
  logger.log(`Runtime mode: ${configService.get<string>("NODE_ENV") ?? "development"}`);
}

void bootstrap();
