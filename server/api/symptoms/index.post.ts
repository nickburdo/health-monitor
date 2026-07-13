import { readBody } from 'h3';
import { symptomsRepository } from '#server/repositories/symptomsRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return symptomsRepository.create({
    ...body,
    userId: devUserId,
  });
});
