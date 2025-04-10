// src/providers/dto/create-provider.dto.ts
import { Account } from '@entity';
import { IsString, IsNumber } from 'class-validator';

//IsOptional옵션은 Undifined된 데이터를 받을 수 있으면서 값이 존재할 때는 @IsString(), @IsNumber()등으로 타입체크 가능하다.

export class CreateProviderDto {
  @IsNumber()
  account: Account;

  @IsString()
  name: string;
}

export class ProviderDto {
  @IsNumber()
  account_id?: number;

  @IsString()
  name?: string;
}
