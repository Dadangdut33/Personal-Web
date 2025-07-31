import { createInertiaApp } from '@inertiajs/react'
import { ColorSchemeScript, MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import { NavigationProgress } from '@mantine/nprogress'
import ReactDOMServer from 'react-dom/server'

import AppProvider from '@/components/provider'
import { theme } from '@/theme'

export default function render(page: any) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = import.meta.glob('../pages/**/*.tsx', { eager: true })
      return pages[`../pages/${name}.tsx`]
    },
    setup: ({ App, props }) => {
      return (
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
    },
  })
}
