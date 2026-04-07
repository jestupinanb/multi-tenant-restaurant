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
    const fn = () => pipe.transform('not-an-objectid');
    expect(fn).toThrow(BadRequestException);
    expect(fn).toThrow('Invalid id format: not-an-objectid');
  });

  it('should throw BadRequestException for an empty string', () => {
    const fn = () => pipe.transform('');
    expect(fn).toThrow(BadRequestException);
    expect(fn).toThrow('Invalid id format: ');
  });

  it('should throw BadRequestException for a 12-character non-hex string', () => {
    const fn = () => pipe.transform('123456789012');
    expect(fn).toThrow(BadRequestException);
    expect(fn).toThrow('Invalid id format: 123456789012');
  });
});
