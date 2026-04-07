import { IsString } from 'class-validator';

export class TestHealthDto {
  @IsString()
  name: string;
}
