import { glucoseRepository } from '../../repositories/glucoseRepository';

const devUserId = 'dev-user';

export default defineEventHandler(async () => {
  return glucoseRepository.list(devUserId);
});
