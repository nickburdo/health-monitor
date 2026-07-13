import { symptomsRepository } from '#server/repositories/symptomsRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async () => {
  return symptomsRepository.list(devUserId);
});
