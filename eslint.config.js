import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
    },
    rules: {
      ...js.configs.recommended.rules,

      // Without these two, `no-unused-vars` cannot see JSX. Every `motion`
      // import used only as `<motion.div>` was reported as dead — 24 files'
      // worth of false positives that made the lint baseline unreadable and
      // invited a "cleanup" that would have broken the app.
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',

      ...reactHooks.configs.recommended.rules,
      // Accessibility: reported as warnings, not errors. The plugin finds 139
      // real problems on arrival (125 of them unlabelled form controls), and
      // fixing those is Phase 7, not Release 2. Warning keeps them visible and
      // counted without wedging a pipeline that must go green today.
      ...Object.fromEntries(
        Object.keys(jsxA11y.flatConfigs.recommended.rules).map((rule) => [rule, 'warn'])
      ),

      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },

  // Node, not the browser. Serverless functions and build tooling legitimately
  // reach for `process`, `module`, and `__dirname`; flagging them as undefined
  // was a lint misconfiguration, not seven bugs.
  {
    files: ['api/**/*.js', '*.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },

  // Test files run under Vitest in jsdom: browser globals plus the Node ones
  // used to resolve fixtures, plus Vitest's injected globals.
  {
    files: ['**/*.{test,spec}.{js,jsx}', 'src/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, ...globals.vitest },
    },
  },
]
