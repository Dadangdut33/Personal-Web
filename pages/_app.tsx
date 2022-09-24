import "../styles/fonts.css";
import "../styles/globals.css";
import "../styles/dashboard.css";
import "../styles/markdown.css";
import { AppProps } from "next/app";
import { MantineProvider, ColorScheme, ColorSchemeProvider } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { RouterTransition } from "../src/components/Utils/Looks/RouterTransition";
import { ModalsProvider } from "@mantine/modals";
import { useLocalStorage } from "@mantine/hooks";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";
import Head from "next/head";

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
	const { Component, pageProps } = props;
	const router = useRouter();
	const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({ key: "mantine-color-scheme", defaultValue: "dark" });

	const toggleColorScheme = (value?: ColorScheme) => {
		const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark");
		setColorScheme(nextColorScheme);
	};

	return (
		<>
			<Head>
				{!router.pathname.includes("admin") && <script async defer data-website-id="de9022cd-16b7-4cb7-917c-956d5ae0dc6e" src="https://analytics.dadangdut33.codes/umami.js"></script>}
			</Head>

			<ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
				<MantineProvider
					theme={{
						colorScheme,
						lineHeight: "1.2", // default web line height
						colors: {
							dark: ["#FFFFFF", "#A6A7AB", "#909296", "#5C5F66", "#373A40", "#2c3048", "#303446", "#24273a", "#141517", "#101113"],
						},
						fontFamily: 'Lato, -apple-system, "BlinkMacSystemFont", "Segoe UI", sans-serif, Roboto, "Apple Color Emoji", "Segoe UI Emoji"',
						headings: {
							fontFamily: "Poppins, sans-serif",
							sizes: {
								h1: { fontSize: "2.5rem" },
								h2: { fontSize: "2rem" },
								h3: { fontSize: "1.75rem" },
								h4: { fontSize: "1.5rem" },
								h5: { fontSize: "1.25rem" },
								h6: { fontSize: "1rem" },
							},
						},
					}}
					withCSSVariables
					withGlobalStyles
					withNormalizeCSS
				>
					<ModalsProvider>
						<NotificationsProvider position="bottom-center">
							<RouterTransition />
							<AnimatePresence exitBeforeEnter initial={false} onExitComplete={() => window.scrollTo(0, 0)}>
								<Component {...pageProps} key={router.pathname} />
							</AnimatePresence>
						</NotificationsProvider>
					</ModalsProvider>
				</MantineProvider>
			</ColorSchemeProvider>
		</>
	);
}
