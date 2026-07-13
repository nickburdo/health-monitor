import { glucoseRepository } from '../../repositories/glucoseRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return glucoseRepository.create({
    ...body,
    userId: devUserId,
  });
});
