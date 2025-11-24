import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateClothInput {
  @Field()
  @IsNotEmpty()
  name: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  basePrice: number;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field(() => Int)
  @IsNotEmpty()
  category: number;

  @Field({ nullable: true })
  @IsOptional()
  modelUrl?: string;
}
