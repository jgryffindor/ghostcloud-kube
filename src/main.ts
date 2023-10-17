import { LogLevel, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { AppConfigService } from "./config/app/configuration.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const appConfig: AppConfigService = app.get(AppConfigService);

  app.setGlobalPrefix("/api/v1");
  app.useLogger([
    ...(appConfig.debug ? ["debug" as LogLevel] : []),
    "log",
    "warn",
    "error",
  ]);

  const config = new DocumentBuilder()
    .setTitle(appConfig.name)
    .setDescription("The Ghostcloud Kubernetes Operator API and Scheduler")
    .setVersion("0.1")
    .addTag("ghostcloud")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(appConfig.port);
}

bootstrap();
