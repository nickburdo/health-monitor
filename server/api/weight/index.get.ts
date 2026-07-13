import { weightRepository } from '#server/repositories/weightRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async () => {
  return weightRepository.list(devUserId);
});
