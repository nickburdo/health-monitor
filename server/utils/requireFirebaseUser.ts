import { firebaseAdminAuth } from './firebase-admin';
import { H3Event } from 'h3';

export async function requireFirebaseUser(event: H3Event) {
  const authorization = getHeader(event, 'authorization');

  if (!authorization?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing auth token',
    });
  }

  const token = authorization.slice('Bearer '.length);

  try {
    const decodedToken = await firebaseAdminAuth.verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
    };
  } catch {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid auth token',
    });
  }
}
