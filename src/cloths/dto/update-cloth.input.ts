import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsOptional, IsNumber, Min } from 'class-validator';

@InputType()
export class UpdateClothInput {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  @IsOptional()
  name?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  category?: number;

  @Field({ nullable: true })
  @IsOptional()
  modelUrl?: string;
}
