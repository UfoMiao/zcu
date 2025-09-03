import { eslintBase } from '@zcu/eslint-config'

export default eslintBase({
  ignores: ['dist/**/*', 'coverage/**/*'],
  rules: {
    // 测试文件中允许更宽松的规则
    'no-console': 'off',
  },
})
