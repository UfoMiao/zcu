import type { OptionsConfig, TypedFlatConfigItem } from '@antfu/eslint-config'
import antfu from '@antfu/eslint-config'
import { defu } from 'defu'

export type ZcuConfig = OptionsConfig & TypedFlatConfigItem

const baseConfig: ZcuConfig = {
  formatters: true,
  typescript: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
  },
  rules: {
    // Console 相关
    'no-console': 'off',

    // TypeScript 相关
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // 导入相关
    'unused-imports/no-unused-imports': 'error',

    // 强制使用全等
    'eqeqeq': ['error', 'smart'],

    // 禁止空块语句
    'no-empty': 'warn',

    // 箭头函数的参数必须用括号括起来
    'style/arrow-parens': ['error', 'always'],

    // 强制使用 1TBS 大括号风格，不允许单行
    'style/brace-style': ['error', '1tbs', { allowSingleLine: false }],

    // 在多行结构中要求使用拖尾逗号
    'style/comma-dangle': ['error', 'always-multiline'],

    // 强制使用 2 个空格缩进
    'style/indent': ['error', 2, { SwitchCase: 1 }],

    // 首选使用单引号
    'style/quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: 'always' }],
  },
}

export function eslintBase(config?: ZcuConfig): ReturnType<typeof antfu> {
  return antfu(defu(config || {}, baseConfig))
}
