import { HandleOnComplete } from '@/components/Router';
import { WEB_NAME } from '@/lib/constants';
import { dmSans } from '@/styles/fonts';
import { theme } from '@/styles/theme';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';

import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import '@mantine/notifications/styles.css';

import { NavigationProgress } from '@mantine/nprogress';

import '@mantine/nprogress/styles.css';
import 'mantine-react-table/styles.css';

import { SpeedInsights } from '@vercel/speed-insights/next';

import Analytics from './analytics';

import './globals.css';

import { ViewTransitions } from 'next-view-transitions';

import { AppProvider } from './provider';

export const metadata = {
  title: { default: WEB_NAME, template: `%s - ${WEB_NAME}` },
  description:
    'My personal website / portofolio. I write about programming, web development, and other things that I find interesting.',
  keywords: ['Personal', 'Blog', 'Portofolio', 'Projects', 'Programming', 'Web Development', 'Technology'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransitions>
      <html lang="en-US">
        <head>
          <ColorSchemeScript />
          <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />
          <Analytics />
        </head>
        <body className={dmSans.className}>
          <MantineProvider theme={theme}>
            <NavigationProgress size={7} color="black" />
            <Notifications />
            <ModalsProvider>
              <AppProvider>{children}</AppProvider>
            </ModalsProvider>
            <HandleOnComplete />
            <SpeedInsights />
          </MantineProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
