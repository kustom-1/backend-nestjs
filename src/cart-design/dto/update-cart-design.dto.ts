import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDesignDto } from './create-cart-design.dto';

export class UpdateCartDesignDto extends PartialType(CreateCartDesignDto) {}
