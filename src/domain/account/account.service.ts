import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Account } from "@entity";
import { AccountDto } from "./account.dto";

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private accountRepository: Repository<Account>
  ) {}

  create(account: AccountDto): Promise<Account> {
    return this.accountRepository.save(account);
  }

  async list(accountReq: AccountDto): Promise<Account[]> {
    const accounts: Account[] = await this.accountRepository.find({
      where: { email: accountReq.email, name: accountReq.name },
    });

    return accounts;
  }

  async find(accountReq: AccountDto): Promise<Account> {
    const account: Account = await this.accountRepository.findOne({
      where: accountReq,
    });

    return account;
  }
}
