import { PartialType } from '@nestjs/mapped-types';
import { CreateClothDto } from './create-cloth.dto';

export class UpdateClothDto extends PartialType(CreateClothDto) {}
