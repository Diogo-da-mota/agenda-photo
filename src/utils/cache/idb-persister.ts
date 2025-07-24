import { get, set, del } from 'idb-keyval';
import {
  Persister,
} from '@tanstack/react-query-persist-client';

/**
 * Cria um persister customizado para o IndexedDB usando idb-keyval.
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery') {
  return {
    persistClient: async (client) => {
      await set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
} 