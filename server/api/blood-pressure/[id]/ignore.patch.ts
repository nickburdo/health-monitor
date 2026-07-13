import { getRouterParam, readBody } from 'h3';
import { bloodPressureRepository } from '#server/repositories/bloodPressureRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing blood pressure measurement id',
    });
  }

  const body = await readBody(event);

  await bloodPressureRepository.update(id, devUserId, {
    ...body,
    ignore: true,
  });

  return {
    success: true,
  };
});
