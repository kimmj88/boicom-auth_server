import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

//Provider
import { Provider } from "@entity";
import { CreateProviderDto, ProviderDto } from "./provider.dto";

@Injectable()
export class ProviderService {
  constructor(
    @InjectRepository(Provider)
    private providerRepository: Repository<Provider>
  ) {}

  async create(providerReq: CreateProviderDto): Promise<Provider> {
    return await this.providerRepository.save(providerReq);
  }

  async list(providerReq: ProviderDto): Promise<Provider[]> {
    return await this.providerRepository.find({
      where: {
        name: providerReq.name,
        account: { id: providerReq.account_id },
      },
    });
  }
}
