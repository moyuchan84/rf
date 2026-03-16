import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../web-backend/src/schema.gql',
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  generates: {
    'src/shared/api/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;
