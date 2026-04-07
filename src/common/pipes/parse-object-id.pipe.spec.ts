import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ParseObjectIdPipe } from './parse-object-id.pipe';

describe('ParseObjectIdPipe', () => {
  let pipe: ParseObjectIdPipe;

  beforeEach(() => {
    pipe = new ParseObjectIdPipe();
  });

  it('should return Types.ObjectId for a valid ObjectId string', () => {
    const validId = new Types.ObjectId().toHexString();
    const result = pipe.transform(validId);

    expect(result).toBeInstanceOf(Types.ObjectId);
    expect(result.toHexString()).toBe(validId);
  });

  it('should throw BadRequestException for an invalid ObjectId string', () => {
    expect(() => pipe.transform('not-an-objectid')).toThrow(BadRequestException);
    expect(() => pipe.transform('not-an-objectid')).toThrow(
      'Invalid id format: not-an-objectid',
    );
  });

  it('should throw BadRequestException for an empty string', () => {
    expect(() => pipe.transform('')).toThrow(BadRequestException);
    expect(() => pipe.transform('')).toThrow('Invalid id format: ');
  });
});
