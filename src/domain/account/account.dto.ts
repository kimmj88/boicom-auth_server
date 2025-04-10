// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsOptional,
  isNumber,
  IsNumber,
} from 'class-validator';

//IsOptional옵션은 Undifined된 데이터를 받을 수 있으면서 값이 존재할 때는 @IsString(), @IsNumber()등으로 타입체크 가능하다.

export class AccountDto {
  @IsNumber()
  id?: number;

  @IsString()
  name?: string;

  @IsEmail()
  email?: string;

  @IsString()
  department?: string;

  @IsString()
  provider?: string;
}

export class CreateAccountDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  department: string;
}

export class LoginAccountDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  department: string;
}

export class LoginResponse {
  redirectUrl: string;
  result: boolean;
}

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;
}
