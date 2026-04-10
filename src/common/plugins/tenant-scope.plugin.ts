import { Model, Query, Schema } from 'mongoose';

export function tenantScopePlugin(schema: Schema): void {
  // Guard all query operations — ensure restaurantId is in the filter
  schema.pre(
    /^find|findOne|findOneAndUpdate|findOneAndDelete|updateOne|deleteOne|countDocuments/,
    function (this: Query<unknown, unknown>) {
      const filter = this.getFilter() as Record<string, unknown>;
      if (!filter.restaurantId) {
        const model = this.model as Model<unknown>;
        throw new Error(`Query on ${model.modelName} requires restaurantId`);
      }
    },
  );

  // Guard document creation — ensure restaurantId is set before validation
  schema.pre('validate', function () {
    if (!this.get('restaurantId')) {
      throw new Error(
        `Document ${this.constructor.name} requires restaurantId`,
      );
    }
  });
}
