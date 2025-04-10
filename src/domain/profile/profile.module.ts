import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '@entity';
import { ProfileService } from '@domain/profile/profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
