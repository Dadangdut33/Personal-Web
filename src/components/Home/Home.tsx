import type { NextPage } from "next";
import Head from "next/head";
import Typewriter from "typewriter-effect";
import { Center, createStyles, Title, Text, Group, Stack, Button } from "@mantine/core";
import { Wrapper } from "../Utils/Template/Wrapper";
import { NoScrollLink } from "../Utils/Looks/NoScrollLink";

const useStyles = createStyles((theme) => ({
	contentWrap: {
		width: "90%",
		maxWidth: "500px",
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

const title = "Dadangdut33",
	desc = "Dadangdut33's personal website. It is somewhat of an online portofolio that showcase some of my projects and place where I can share my thoughts and experiences.";

export const Home: NextPage = (props) => {
	const { classes } = useStyles();

	return (
		<>
			<Head>
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
				<meta property="og:image" content="/assets/preview.png" />
				<meta property="og:url" content="https://dadangdut33.codes/" />
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Dadangdut33" />
				<meta property="og:locale" content="en_US" />

				<meta property="twitter:card" content="summary" />
				<meta property="twitter:creator" content="@dadangdut33" />
				<meta property="twitter:title" content={title} />
				<meta property="twitter:url" content="https://dadangdut33.codes/" />
				<meta property="twitter:description" content={desc} />
				<meta property="twitter:image" content="/assets/preview.png" />
				<script async defer data-website-id="cfb71c71-fdeb-47e0-b985-32661e1279c5" src="https://analytics.dadangdut33.codes/umami.js"></script>
			</Head>

			<Wrapper>
				<Center>
					<Stack spacing={0} className={"header-spacing"}>
						<Stack spacing={0}>
							<Center>
								<picture>
									<img src="/logo512.png" alt="Logo" className="logo-main" />
								</picture>
							</Center>
							<Center>
								<Stack className={"center-text"} spacing={"xs"}>
									<Title order={1} mt="xl">
										Hello! I&apos;m{" "}
										<Text variant="gradient" component="span" gradient={{ from: "blue", to: "cyan", deg: 30 }} inherit>
											Fauzan
										</Text>
									</Title>

									<div className={classes.centerMobile}>
										<Group spacing={"xs"}>
											<Text>A</Text>
											<Text size={"xl"} variant="gradient" gradient={{ from: "blue", to: "cyan", deg: 30 }}>
												<Typewriter
													options={{
														strings: ["Full Stack Developer", "Student", "Leaner"],
														autoStart: true,
														loop: true,
													}}
												/>
											</Text>
										</Group>
									</div>
								</Stack>
							</Center>
						</Stack>
						<Stack spacing={8} mt={"xl"}>
							<Center>
								<Group className={classes.contentWrap + " center-text"}>
									I&apos;m currently pursuing my bachelor degree as an Informatics Engineering Student at UIN Jakarta. I like to learn new things and do some coding for side projects on my
									free time.
								</Group>
							</Center>
						</Stack>

						<Center mt={"xl"}>
							<Group>
								<NoScrollLink href={"/project"} passHref>
									<Button component="a">Projects</Button>
								</NoScrollLink>
								<NoScrollLink href={"/blog"} passHref>
									<Button component="a" color={"lime"}>
										Blog
									</Button>
								</NoScrollLink>
							</Group>
						</Center>
					</Stack>
				</Center>
			</Wrapper>
		</>
	);
};
