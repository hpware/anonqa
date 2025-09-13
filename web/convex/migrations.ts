/*import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();

export const setDefaultValue = migrations.define({
  table: "users",
  migrateOne: async (ctx, user) => {
    if (user.optionalField === undefined) {
      await ctx.db.patch(user._id, { optionalField: "default" });
    }
  },
});
 */
