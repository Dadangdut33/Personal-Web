import { HandleOnComplete } from "@/components/Router";
import { WEB_NAME } from "@/lib/constants";
import { open_sans } from "@/styles/fonts";
import { theme } from "@/styles/theme";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/dropzone/styles.css";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import { NavigationProgress } from "@mantine/nprogress";
import "@mantine/nprogress/styles.css";
import "mantine-react-table/styles.css";

import Analytics from "./analytics";
import "./globals.css";
import { AppProvider } from "./provider";

export const metadata = {
  title: { default: WEB_NAME, template: `%s | ${WEB_NAME}` },
  description:
    "My personal website / portofolio. I write about programming, web development, and other things that I find interesting.",
  keywords: ["Personal", "Blog", "Portofolio", "Services"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-US">
      <head>
        <ColorSchemeScript />
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no" />
        <Analytics />
      </head>
      <body className={open_sans.className}>
        <MantineProvider theme={theme}>
          <NavigationProgress size={5} />
          <Notifications />
          <ModalsProvider>
            <AppProvider>{children}</AppProvider>
          </ModalsProvider>
          <HandleOnComplete />
        </MantineProvider>
      </body>
    </html>
  );
}
