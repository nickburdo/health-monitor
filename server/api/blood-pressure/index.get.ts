import { bloodPressureRepository } from '#server/repositories/bloodPressureRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async (event) => {
  return bloodPressureRepository.list(devUserId);
});
