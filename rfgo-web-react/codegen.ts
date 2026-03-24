import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: '../rfgo-web-nestjs/src/schema.gql',
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  generates: {
    'src/shared/api/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;

