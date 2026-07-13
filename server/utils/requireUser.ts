import { H3Event } from 'h3';
import { firebaseAdminAuth } from '#server/utils/firebase-admin';

export async function requireUser(event: H3Event) {
  const authorization = getHeader(event, 'authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }

  const token = authorization.slice('Bearer '.length);

  return await firebaseAdminAuth.verifyIdToken(token);
}
