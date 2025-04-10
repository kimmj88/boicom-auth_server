import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

//Provider
import { Provider } from '@entity';
import { ProviderService } from '@domain/provider/provider.service';

@Module({
  imports: [TypeOrmModule.forFeature([Provider])],
  providers: [ProviderService],
  exports: [ProviderService],
})
export class ProviderModule {}
