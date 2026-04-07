import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class ParseObjectIdPipe implements PipeTransform<string, Types.ObjectId> {
  transform(value: string): Types.ObjectId {
    const hexRegex = /^[a-f\d]{24}$/i;
    if (!hexRegex.test(value) || !Types.ObjectId.isValid(value)) {
      throw new BadRequestException(`Invalid id format: ${value}`);
    }
    return new Types.ObjectId(value);
  }
}
