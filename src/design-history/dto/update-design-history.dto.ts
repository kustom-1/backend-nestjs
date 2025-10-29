import { PartialType } from '@nestjs/mapped-types';
import { CreateDesignHistoryDto } from './create-design-history.dto';

export class UpdateDesignHistoryDto extends PartialType(CreateDesignHistoryDto) {}
