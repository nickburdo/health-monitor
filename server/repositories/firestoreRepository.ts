import { db } from '../utils/firestore';
import { GeneralType } from '~/types';

type CreateEntityInput<T extends GeneralType> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
>;

type UpdateEntityInput<T extends GeneralType> = Partial<
  Omit<T, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export function createFirestoreRepository<T extends GeneralType>(
  collectionName: string,
) {
  const collection = db.collection(collectionName);

  return {
    async list(userId: string): Promise<T[]> {
      const snapshot = await collection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    },

    async create(input: CreateEntityInput<T>): Promise<T> {
      const now = new Date().toISOString();

      const docRef = await collection.add({
        ...input,
        createdAt: now,
        updatedAt: now,
      });

      const doc = await docRef.get();

      return {
        id: doc.id,
        ...doc.data(),
      } as T;
    },

    async update(
      id: string,
      userId: string,
      input: UpdateEntityInput<T>,
    ): Promise<T> {
      const docRef = collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Document not found',
        });
      }

      const data = doc.data() as T;

      if (data.userId !== userId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
        });
      }

      await docRef.update({
        ...input,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await docRef.get();

      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      } as T;
    },

    async remove(id: string, userId: string): Promise<void> {
      const docRef = collection.doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Document not found',
        });
      }

      const data = doc.data() as T;

      if (data.userId !== userId) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Forbidden',
        });
      }

      await docRef.delete();
    },
  };
}
