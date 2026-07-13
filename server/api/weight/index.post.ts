import { readBody } from 'h3';
import { weightRepository } from '#server/repositories/weightRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return weightRepository.create({
    ...body,
    userId: devUserId,
  });
});
