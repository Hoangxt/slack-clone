import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

// import { Doc } from './_generated/dataModel';
import { mutation, query } from './_generated/server';

// const generateCode = () => {
//   const code = Array.from(
//     { length: 6 },
//     () => '0123456789abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 36)]
//   ).join('');

//   return code;
// };

export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // const joinCode = generateCode();
    const joinCode = '123456';

    const workspaceId = await ctx.db.insert('workspaces', {
      name: args.name,
      userId,
      joinCode,
    });

    return workspaceId;
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('workspaces').collect();
  },
});
