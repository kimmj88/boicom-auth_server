import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { ProfileModule } from '@domain/profile/profile.module';
import { ProfileService } from '@domain/profile/profile.service';
import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors({
    origin: true, // 허용할 프론트엔드 도메인
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 인증 정보 허용
    allowedHeaders: 'Content-Type,Authorization', // Content-Type 헤더 허용
  });

  const configService = app.get(ConfigService);
  const profileService = app.get(ProfileService);

  let port: string = configService.get<string>('port');

  const useHttps = await profileService.getProfileBool({
    section: 'SERVER',
    entry: 'AUTH_HTTPS',
    default: false,
  });

  const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem'),
  };

  await app.init();

  if (useHttps) {
    https.createServer(httpsOptions, server).listen(port);
    console.log(`HTTPs Server is running on http://localhost:${port}`);
  } else {
    http.createServer(server).listen(port);
    console.log(`HTTP Server is running on http://localhost:${port}`);
  }

  //await app.listen(port || 3000);
}
bootstrap();
