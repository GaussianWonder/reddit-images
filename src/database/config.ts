import type { Options } from '@mikro-orm/core';
import type { SqliteDriver } from '@mikro-orm/sqlite';
import { defineConfig } from '@mikro-orm/core';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import config from '../env/config';

export const MigroORMConfig: Options<SqliteDriver> = defineConfig({
  metadataProvider: TsMorphMetadataProvider,
  entities: ['./dist/database/entities'],
  entitiesTs: ['./src/database/entities'],
  migrations: {
    tableName: 'migrations',
    path: './dist/database/migrations',
    pathTs: './src/database/migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true,
    dropTables: true,
    safe: false,
    snapshot: true,
    emit: 'ts',
  },
  dbName: config.database.name,
  type: 'sqlite',
  /**
   * https://mikro-orm.io/docs/identity-map#why-is-request-context-needed
   * This uses a global context since ops are not concurrent and there is no need for a request context.
   */
  allowGlobalContext: true,
});

export default MigroORMConfig;
