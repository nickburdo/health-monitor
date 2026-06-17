import type { H3Event } from 'h3';
import { serverSupabaseUser } from '#supabase/server';
import { prisma } from './prisma';

export type RequestActor = { kind: 'guest' } | {
  kind: 'admin';
  userId: string;
};

export async function getRequestActor(event: H3Event): Promise<RequestActor> {
  const user = await serverSupabaseUser(event);
  const userId = typeof user?.sub === 'string' ? user.sub : null;

  if (!userId) {
    return { kind: 'guest' };
  }

  const rows = await prisma.$queryRaw<Array<{ userId: string }>>`
    select user_id as "userId"
    from private.admin_users
    where user_id = ${userId}::uuid
    limit 1
  `;

  if (rows.length === 0) {
    return { kind: 'guest' };
  }

  return {
    kind: 'admin',
    userId,
  };
}
