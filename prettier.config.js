// @ts-check
/** @type {import('prettier').Config} */
const config = {
  // Basic formatting
  semi: false, // No semicolons - cleaner for Go/TypeScript developers
  singleQuote: true, // Prefer single quotes for strings
  trailingComma: 'all', // Always use trailing commas (better git diffs)
  quoteProps: 'as-needed', // Only quote object properties when necessary
  bracketSpacing: true, // Spaces inside object literals { foo: bar }
  bracketSameLine: false, // Put > of multi-line elements on new line
  arrowParens: 'always', // Always include parens around arrow function args

  // Line handling
  printWidth: 80, // Industry standard, works well on most screens
  tabWidth: 2, // 2 spaces for indentation (JavaScript/TypeScript standard)
  useTabs: false, // Use spaces instead of tabs for consistency
  endOfLine: 'lf', // Use Unix line endings (important for git)
  proseWrap: 'preserve', // Don't wrap markdown text

  // HTML/JSX/TSX specific
  jsxSingleQuote: false, // Use double quotes in JSX (HTML convention)
  htmlWhitespaceSensitivity: 'css', // Respect CSS display property
  embeddedLanguageFormatting: 'auto', // Format embedded code (template literals, etc.)
  singleAttributePerLine: false, // Multiple props on same line if they fit

  // Other options
  requirePragma: false, // Don't require @prettier comment to format
  insertPragma: false, // Don't insert @prettier comment
  rangeStart: 0, // Format entire file
  rangeEnd: Infinity, // Format entire file

  // Plugin-specific options
  plugins: [
    'prettier-plugin-tailwindcss', // Must be last for Tailwind CSS class sorting
  ],

  // Overrides for specific file types
  overrides: [
    {
      files: '*.md',
      options: {
        proseWrap: 'always', // Wrap markdown at printWidth
        printWidth: 80,
      },
    },
    {
      files: '*.mdx',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 80,
        trailingComma: 'none', // No trailing commas in JSON
      },
    },
    {
      files: '*.yml',
      options: {
        singleQuote: false, // YAML prefers double quotes
      },
    },
    {
      files: ['*.css', '*.scss', '*.less'],
      options: {
        singleQuote: false, // CSS convention uses double quotes
      },
    },
    {
      files: 'package.json',
      options: {
        printWidth: 1000, // Don't wrap package.json scripts
      },
    },
    {
      files: ['*.tsx', '*.ts'],
      options: {
        // TypeScript specific options if needed
        arrowParens: 'always', // Type safety for generics
      },
    },
    {
      files: ['*.jsx', '*.tsx'],
      options: {
        // You might want different JSX formatting
        bracketSameLine: false,
        jsxSingleQuote: false,
        singleAttributePerLine: false,
      },
    },
    {
      files: '.prettierrc',
      options: {
        parser: 'json',
      },
    },
    {
      files: ['*.html'],
      options: {
        printWidth: 120, // HTML can be wider
        bracketSameLine: true,
      },
    },
  ],
}

export default config
