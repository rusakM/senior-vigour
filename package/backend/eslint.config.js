// eslint.config.js
import globals from 'globals';
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
    {
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: './tsconfig.json',
                ecmaVersion: 2024,
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
                ...globals.es2024,
            },
        },
        plugins: {
            '@typescript-eslint': typescript,
        },
        files: ['./src/**/*.ts'],
        rules: {
            ...js.configs.recommended.rules,
            ...typescript.configs.recommended.rules,
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-namespace': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/explicit-member-accessibility': 'off',
            'no-console': 'off',
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            indent: ['error', 4],
            'object-curly-spacing': ['error', 'always'],
            'array-bracket-spacing': ['error', 'never'],
            'no-multiple-empty-lines': ['error', { max: 1 }],
            'eol-last': ['error', 'always'],
            'no-trailing-spaces': 'error',
            'prefer-const': 'error',
            'arrow-parens': ['error', 'always'],
            'arrow-spacing': ['error', { before: true, after: true }],
            'preserve-caught-error': 'off',
            'no-useless-assignment': 'off',
        },
    },
];
