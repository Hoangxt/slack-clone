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

export const getById = query({
  args: {
    id: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error('Unauthorized');
    }

    // const member = await ctx.db
    //   .query('members')
    //   .withIndex('by_workspace_id_user_id', (q) =>
    //     q.eq('workspaceId', args.id).eq('userId', userId)
    //   )
    //   .unique();

    // if (!member) {
    //   return null;
    // }

    return await ctx.db.get(args.id);
  },
});
