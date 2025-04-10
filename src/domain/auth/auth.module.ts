import { Module } from '@nestjs/common';

import { AuthController } from '@domain/auth/auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

//entity
import { Account, Provider } from '@entity';

//module
import { AccountModule } from '@domain/account/account.module';
import { ProviderModule } from '@domain/provider/provider.module';
import { ProfileModule } from '@domain/profile/profile.module';

//service
import { AuthService } from '@domain/auth/auth.service';
import { MicrosoftAuthService } from '@domain/auth/service/microsoft-auth.service';
import { JwtAuthGuard } from '@domain/auth/guard/jwt-auth.guard';

import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AccountModule,
    ProviderModule,
    ConfigModule,
    ProfileModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MicrosoftAuthService, JwtAuthGuard],
})
export class AuthModule {}
