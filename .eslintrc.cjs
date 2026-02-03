module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
<<<<<<< HEAD
=======
  overrides: [
    {
      files: ['backend/**/*.js', 'backend/**/*.jsx'],
      env: { node: true, es2020: true },
      rules: {
        'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      },
    },
  ],
>>>>>>> 57aaee95c582e73f35a15cb51cf06fbe324c181e
}
