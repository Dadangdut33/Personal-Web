import { defineConfig } from '@adonisjs/inertia'

const inertiaConfig = defineConfig({
  rootView: 'inertia_layout',
  encryptHistory: true,
  ssr: {
    enabled: true,
  },
})

export default inertiaConfig
