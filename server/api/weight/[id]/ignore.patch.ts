import { getRouterParam, readBody } from 'h3';
import { weightRepository } from '#server/repositories/weightRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing weight measurement id',
    });
  }

  const body = await readBody(event);

  await weightRepository.update(id, devUserId, { ...body, ignore: true });

  return {
    success: true,
  };
});
