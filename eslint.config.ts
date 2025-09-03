import { eslintBase } from '@zcu/eslint-config'

export default eslintBase({
  ignores: ['dist/**/*', 'coverage/**/*', '**/*.d.ts', '**/*.md'],
})
