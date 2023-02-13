import type { SqliteDriver } from '@mikro-orm/sqlite'; // or any other driver package
import { MikroORM } from '@mikro-orm/core';
import MikroORMConfig from './config';

export const initORM = async () =>
  await MikroORM.init<SqliteDriver>(MikroORMConfig);
