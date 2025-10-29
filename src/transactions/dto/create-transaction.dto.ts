import { IsInt, IsOptional, IsNumber, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @IsInt()
  order?: number;

  @ApiProperty({ type: Number })
  @IsNumber()
  amount: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false, type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  transactionDate?: string;
}
