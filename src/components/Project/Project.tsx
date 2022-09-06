import type { NextPage } from "next";
import Head from "next/head";
import Typewriter from "typewriter-effect";
import { Center, createStyles, Title, Text, Group, Stack } from "@mantine/core";
import { Wrapper } from "../Utils/Template/Wrapper";

const useStyles = createStyles((theme) => ({
	titleWrapper: {
		marginTop: "4rem",
	},
	contentWrap: {
		width: "90%",
		maxWidth: "500px",
	},
	centerText: {
		textAlign: "center",
		textJustify: "inter-word",
	},
	centerMobile: {
		[theme.fn.smallerThan("xs")]: {
			display: "flex",
			textAlign: "center",
			textJustify: "inter-word",
			justifyContent: "center",
			alignItems: "center",
		},
	},
}));

export const Project: NextPage = (props) => {
	const { classes } = useStyles();
	const title = "Projects | Dadangdut33",
		desc = "Showcase of some of my projects or things that i have made on my free time";
	return (
		<>
			<Head>
				<title>test</title>

				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/logo192.png" />

				<title>{title}</title>

				<meta name="title" content={title} />
				<meta name="description" content={desc} />

				<meta property="og:title" content={title} />
				<meta property="og:description" content={desc} />
				<meta property="og:image" content="/logo512.png" />
				<meta property="og:url" content="https://dadangdut33.codes/" />
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Dadangdut33" />
				<meta property="og:locale" content="en_US" />

				<meta property="twitter:card" content="summary" />
				<meta property="twitter:creator" content="@dadangdut33" />
				<meta property="twitter:title" content={title} />
				<meta property="twitter:url" content="https://dadangdut33.codes/" />
				<meta property="twitter:description" content={desc} />
				<meta property="twitter:image" content="/logo512.png" />
			</Head>

			<Wrapper>
				<Center>
					<Title order={1} mt="xl">
						Projects
					</Title>
				</Center>
			</Wrapper>
		</>
	);
};
