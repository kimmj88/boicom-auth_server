import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';

//module
import { DatabaseModule } from '@database/database.module';
import { ProfileModule } from '@domain/profile/profile.module';

import configuration from '@config/configuration';
import { GlobalExceptionFilter } from './filter/exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { AccountModule } from '@domain/account/account.module';
import { ProviderModule } from '@domain/provider/provider.module';
import { AuthModule } from '@domain/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    DatabaseModule,
    ProfileModule,
    AccountModule,
    ProviderModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
