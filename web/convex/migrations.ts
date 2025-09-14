import { mutation } from "./_generated/server";

interface MigrationResult {
  success: boolean;
  message: string;
  totalUsers: number;
}

// Manual migration to fix schema issues and ensure data consistency
export const migrateUsers = mutation({
  args: {},
  handler: async (ctx): Promise<MigrationResult> => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    let updatedCount = 0;

    for (const user of users) {
      const updates: any = {};

      // Ensure pageType has a default value
      if (!user.pageType) {
        updates.pageType = "basic";
      }

      // Ensure customShortUrlSlug is not null/undefined
      if (!user.customShortUrlSlug) {
        updates.customShortUrlSlug = "";
      }

      // Ensure defaultMessages is an array
      if (!user.defaultMessages || !Array.isArray(user.defaultMessages)) {
        updates.defaultMessages = [];
      }

      // Apply updates if any changes are needed
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
        updatedCount++;
      }
    }

    return {
      success: true,
      message: `Migration completed. Updated ${updatedCount} user records.`,
      totalUsers: users.length,
    };
  },
});

// Migration to clean up any invalid data after schema changes
export const cleanupInvalidData = mutation({
  args: {},
  handler: async (ctx): Promise<MigrationResult> => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    let cleanedCount = 0;

    for (const user of users) {
      const updates: any = {};

      // Ensure controlableUsers is an array
      if (!Array.isArray(user.controlableUsers)) {
        updates.controlableUsers = [];
        cleanedCount++;
      }

      // Ensure defaultMessages contains only strings
      if (Array.isArray(user.defaultMessages)) {
        const validMessages = user.defaultMessages.filter(
          (msg) => typeof msg === "string",
        );
        if (validMessages.length !== user.defaultMessages.length) {
          updates.defaultMessages = validMessages;
          cleanedCount++;
        }
      }

      // Apply updates if any changes are needed
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
      }
    }

    return {
      success: true,
      message: `Data cleanup completed. Cleaned ${cleanedCount} user records.`,
      totalUsers: users.length,
    };
  },
});
