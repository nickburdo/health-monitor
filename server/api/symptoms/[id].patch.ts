import { getRouterParam, readBody } from 'h3';
import { symptomsRepository } from '#server/repositories/symptomsRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing symptom id',
    });
  }

  const body = await readBody(event);

  await symptomsRepository.update(id, devUserId, body);

  return {
    success: true,
  };
});
