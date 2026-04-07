import { PartialType } from '@nestjs/mapped-types';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
  ValidationArguments,
} from 'class-validator';
import { CreateMenuItemDto } from './create-menu-item.dto';

@ValidatorConstraint({ name: 'atLeastOneField' })
class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_: unknown, args: ValidationArguments): boolean {
    const obj = args.object as Record<string, unknown>;
    return ['name', 'price', 'description'].some((k) => obj[k] !== undefined);
  }
  defaultMessage(): string {
    return 'At least one field (name, price, description) must be provided';
  }
}

export class UpdateMenuItemDto extends PartialType(CreateMenuItemDto) {
  @Validate(AtLeastOneFieldConstraint)
  private readonly _atLeastOneField?: never;
}
