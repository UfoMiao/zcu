import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: false,
  },
  externals: [
    'i18next',
    'i18next-fs-backend',
    'pathe',
  ],
  failOnWarn: false,
})
