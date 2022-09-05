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

export const Home: NextPage = (props) => {
	const { classes } = useStyles();

	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<title>Dadangdut33</title>
			</Head>

			<Wrapper>
				<Center>
					<Stack spacing={0} className={classes.titleWrapper}>
						<Stack spacing={0}>
							<Center>
								<picture>
									<img src="/logo512.png" alt="Logo" className="logo-main" />
								</picture>
							</Center>
							<Center>
								<Stack className={classes.centerText} spacing={"xs"}>
									<Title order={1} mt="xl">
										Hello! I'm{" "}
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
								<Group className={classes.contentWrap + " " + classes.centerText}>
									I'm currently pursuing my bachelor degree as an Informatics Engineering Student at UIN Jakarta. I like to learn new things and do some coding for side projects on my free
									time.
								</Group>
							</Center>
						</Stack>
					</Stack>
				</Center>
			</Wrapper>
		</>
	);
};
