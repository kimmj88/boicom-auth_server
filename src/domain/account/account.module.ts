import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

//Entities
import { Account, Provider } from "@entity";

//Service
import { AccountService } from "@domain/account/account.service";

@Module({
  imports: [TypeOrmModule.forFeature([Account, Provider])],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
