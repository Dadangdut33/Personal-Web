/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { createInertiaApp } from '@inertiajs/react'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/dropzone/styles.css'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/notifications/styles.css'
import { NavigationProgress } from '@mantine/nprogress'
import '@mantine/nprogress/styles.css'
import { createRoot, hydrateRoot } from 'react-dom/client'

import AppProvider from '@/components/provider'
import { theme } from '@/theme'

import '../css/app.css'

const appName = import.meta.env.VITE_APP_NAME || 'AdonisJS'

createInertiaApp({
  progress: { color: '#5468FF' },
  title: (title) => `${title} - ${appName}`,
  resolve: (name) => {
    return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
  },

  setup({ el, App, props }) {
    const comp = (
      <MantineProvider theme={theme}>
        <ColorSchemeScript />
        <NavigationProgress />
        <Notifications position="top-right" zIndex={1000} />
        <ModalsProvider
          modalProps={{
            zIndex: 1000,
          }}
        >
          <AppProvider>
            <App {...props} />
          </AppProvider>
        </ModalsProvider>
      </MantineProvider>
    )

    if (import.meta.env.DEV) {
      createRoot(el).render(comp)
      return
    }

    hydrateRoot(el, comp)
  },
})
