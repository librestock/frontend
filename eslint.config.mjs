import baseConfig from '@librestock/eslint-config'
import pluginJsxA11y from 'eslint-plugin-jsx-a11y'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginReactRefresh from 'eslint-plugin-react-refresh'
import pluginSonarjs from 'eslint-plugin-sonarjs'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Extend shared base configuration
  ...baseConfig,

  // Web-specific: Add browser globals
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // React configuration
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // React rules
      ...pluginReact.configs.recommended.rules,
      ...pluginReact.configs['jsx-runtime'].rules,
      ...pluginReactHooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'react/display-name': 'warn',
      'react/jsx-no-leaked-render': 'off',
      'react/jsx-no-target-blank': 'error',
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'react/jsx-pascal-case': ['error', { allowNamespace: true }],
      'react/jsx-sort-props': [
        'warn',
        {
          callbacksLast: true,
          shorthandFirst: true,
          multiline: 'last',
          reservedFirst: true,
        },
      ],
      'react/no-array-index-key': 'warn',
      'react/no-unstable-nested-components': 'error',
      'react/self-closing-comp': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true, allowExportNames: ['Route'] },
      ],
    },
  },

  // Import resolver settings for TypeScript
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
    rules: {
      'import/no-unused-modules': 'warn',
      'import/no-deprecated': 'warn',
      'import/no-anonymous-default-export': 'warn',
    },
  },

  // Accessibility configuration
  {
    plugins: {
      'jsx-a11y': pluginJsxA11y,
    },
    rules: {
      ...pluginJsxA11y.configs.recommended.rules,
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
    },
  },

  // SonarJS code quality
  {
    plugins: {
      sonarjs: pluginSonarjs,
    },
    rules: {
      'sonarjs/no-duplicate-string': ['error', { threshold: 3 }],
      'sonarjs/cognitive-complexity': ['warn', 20],
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/no-redundant-jump': 'error',
    },
  },

  // Additional TypeScript rules for React
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/promise-function-async': 'error',
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        {
          selector: 'typeAlias',
          format: ['PascalCase'],
        },
        {
          selector: 'enum',
          format: ['PascalCase'],
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE'],
        },
      ],
    },
  },

  // Additional JavaScript rules
  {
    rules: {
      'no-alert': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-nested-ternary': 'warn',
      'no-unneeded-ternary': 'error',
      'no-unused-expressions': 'error',
      'no-await-in-loop': 'warn',
      'no-promise-executor-return': 'error',
      'prefer-promise-reject-errors': 'error',
      'no-lonely-if': 'error',
      'no-multi-assign': 'error',
      'no-return-assign': 'error',
      'no-sequences': 'error',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      radix: 'error',
      yoda: ['error', 'never'],
      'max-lines': [
        'warn',
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'warn',
        { max: 100, skipBlankLines: true, skipComments: true },
      ],
      'max-params': ['warn', 4],
      'max-depth': ['warn', 4],
      'max-nested-callbacks': ['warn', 3],
      complexity: ['warn', 20],
    },
  },

  // Test file overrides
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'no-console': 'off',
    },
  },

  // TanStack Start app directory - allow default exports and Route exports
  {
    files: ['**/app/**/*.{ts,tsx}'],
    rules: {
      'import/no-default-export': 'off',
      'import/prefer-default-export': 'off',
    },
  },

  // React components - allow higher limits
  {
    files: ['**/components/**/*.tsx', '**/app/**/*.tsx'],
    rules: {
      'max-lines-per-function': [
        'warn',
        { max: 200, skipBlankLines: true, skipComments: true },
      ],
      complexity: ['warn', 30],
    },
  },

  // Form components need even more room
  {
    files: ['**/components/**/*Form.tsx'],
    rules: {
      'max-lines-per-function': [
        'warn',
        { max: 300, skipBlankLines: true, skipComments: true },
      ],
    },
  },

  // API client helpers: allow direct promise returns in async wrappers
  {
    files: ['src/lib/data/**/*.ts'],
    rules: {
      '@typescript-eslint/return-await': 'off',
    },
  },

  // Web-specific ignores
  {
    ignores: [
      '**/node_modules/**',
      '.pnp',
      '.pnp.js',
      '.yarn/**',
      '.output/**',
      'out/**',
      'dist/**',
      'build/**',
      '*.generated.ts',
      '*.gen.ts',
      '**/generated/**',
      '**/generated.ts',
      '**/routeTree.gen.ts',
      'eslint.config.mjs',
      'prettier.config.js',
      'src/components/ui/**',
      '.env*.local',
      '.idea/**',
      '.vscode/**',
      'coverage/**',
      '*.min.js',
      '*.min.css',
      'public/**/*.js',
      'e2e/**',
      'playwright.config.ts',
    ],
  },
)
