import { IsString } from 'class-validator';

export class ProfileDto {
  @IsString()
  section: string;

  @IsString()
  entry?: string;

  value?: string | number | boolean;

  default?: any;
}
