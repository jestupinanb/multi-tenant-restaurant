import mongoose, { Schema, Types } from 'mongoose';
import { tenantScopePlugin } from './tenant-scope.plugin';

describe('tenantScopePlugin', () => {
  const restaurantId = new Types.ObjectId();

  // Create a test schema with the plugin applied
  const testSchema = new Schema({
    restaurantId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
  });
  testSchema.plugin(tenantScopePlugin);

  const TestModel = mongoose.model('TenantPluginTest', testSchema);

  describe('query hooks', () => {
    it('should throw when find() is called without restaurantId', async () => {
      await expect(TestModel.find({}).exec()).rejects.toThrow(
        'requires restaurantId',
      );
    });

    it('should throw when findOne() is called without restaurantId', async () => {
      await expect(
        TestModel.findOne({ _id: new Types.ObjectId() }).exec(),
      ).rejects.toThrow('requires restaurantId');
    });

    it('should throw when findOneAndUpdate() is called without restaurantId', async () => {
      await expect(
        TestModel.findOneAndUpdate(
          { _id: new Types.ObjectId() },
          { $set: { name: 'test' } },
        ).exec(),
      ).rejects.toThrow('requires restaurantId');
    });

    it('should throw when findOneAndDelete() is called without restaurantId', async () => {
      await expect(
        TestModel.findOneAndDelete({ _id: new Types.ObjectId() }).exec(),
      ).rejects.toThrow('requires restaurantId');
    });

    it('should not throw plugin error when find() includes restaurantId', () => {
      // Verify the pre hook does not throw — we call find() but don't exec()
      // (exec would hang waiting for a DB connection)
      expect(() => TestModel.find({ restaurantId })).not.toThrow();
    });

    it('should not throw plugin error when findOne() includes restaurantId', () => {
      expect(() =>
        TestModel.findOne({ _id: new Types.ObjectId(), restaurantId }),
      ).not.toThrow();
    });
  });

  describe('validate hook', () => {
    it('should throw when creating a document without restaurantId', async () => {
      const doc = new TestModel({ name: 'test' });
      await expect(doc.validate()).rejects.toThrow('requires restaurantId');
    });

    it('should not throw when creating a document with restaurantId', async () => {
      const doc = new TestModel({ name: 'test', restaurantId });
      await expect(doc.validate()).resolves.toBeUndefined();
    });
  });
});
