import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomImageDto } from './create-custom-image.dto';

export class UpdateCustomImageDto extends PartialType(CreateCustomImageDto) {}
