import { readBody } from 'h3';
import { bloodPressureRepository } from '#server/repositories/bloodPressureRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return bloodPressureRepository.create({
    ...body,
    userId: devUserId,
  });
});
