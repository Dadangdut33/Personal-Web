import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Center, Title, Card, Text, Stack, SimpleGrid, LoadingOverlay, ActionIcon, createStyles, Badge, ScrollArea, Group } from "@mantine/core";
import { Wrapper } from "../Utils/Template/Wrapper";
import { SERVER_V1 } from "../../helper";
import { IProject } from "../../interfaces/db";
import { iconMap } from "../Admin/Project";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
	cardLinks: {
		position: "absolute",
		bottom: "10px",
		left: 0,
		right: 0,
		marginLeft: "auto",
		marginRight: "auto",
		textAlign: "center",
	},
}));

const title = "Projects | Dadangdut33",
	desc = "Showcase of some of my projects or things that i have made on my free time";

export const Project: NextPage = (props) => {
	const { classes } = useStyles();
	const [projects, setProjects] = useState<IProject[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadFail, setLoadFail] = useState(false);
	const [failMsg, setFailMsg] = useState("");
	const [maxCol, setMaxCol] = useState(1);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const req = await fetch(SERVER_V1 + "/project", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				const res = await req.json();
				if (req.status !== 200) {
					setLoading(false);
					setLoadFail(true);
					setFailMsg(res.message);
				} else {
					setLoading(false);
					setProjects(res.data);

					if (res.data.length <= 1) setMaxCol(1);
					else if (res.data.length % 2 === 0) setMaxCol(2);
					else setMaxCol(3);
				}
			} catch (error: any) {
				setLoading(false);
				setLoadFail(true);
				setFailMsg(error.message);
			}
		};

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Head>
				<title>{title}</title>

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
					<Stack>
						<Center>
							<Title order={1} mt="xl">
								Projects
							</Title>
						</Center>
						<Center className="relative" mt={"md"}>
							<LoadingOverlay visible={loading} overlayBlur={3} />
							<SimpleGrid
								cols={maxCol}
								sx={{ width: "95%" }}
								breakpoints={[
									{ maxWidth: "md", cols: 3, spacing: "md" },
									{ maxWidth: "sm", cols: 2, spacing: "sm" },
									{ maxWidth: "xs", cols: 1, spacing: "sm" },
								]}
								spacing="lg"
							>
								{projects.map((project) => (
									<motion.div whileHover={{ y: "-7px", transition: { duration: 0.2 } }} key={project._id}>
										<Card shadow="lg" p="lg" radius="md" withBorder sx={{ maxWidth: "350px" }} className="relative">
											<Stack justify="space-between">
												<Stack>
													<Center mb={"xs"}>
														<Title order={5}>{project.title}</Title>
													</Center>

													<Center mb={"xs"}>
														<Text size="sm" color="dimmed" className="center-text">
															{project.description}
														</Text>
													</Center>

													<ScrollArea type="hover" scrollHideDelay={300} scrollbarSize={6} mb="1.5rem">
														<Center mb={"sm"}>
															{project.tags.map((tag) => (
																<Badge key={tag} mx={4}>
																	{tag}
																</Badge>
															))}
														</Center>
													</ScrollArea>
												</Stack>

												<Center className={classes.cardLinks}>
													{project.links && project.links.length > 0
														? project.links.map((links) => {
																const LinkIcon = iconMap[links.type];
																return (
																	<span className="subtle-link" key={links.url}>
																		<Link href={links.url} passHref>
																			<ActionIcon size="lg" component="a" target="_blank" rel="noopener noreferrer">
																				<LinkIcon stroke={1.5} />
																			</ActionIcon>
																		</Link>
																	</span>
																);
														  })
														: "None"}
												</Center>
											</Stack>
										</Card>
									</motion.div>
								))}
							</SimpleGrid>
						</Center>
					</Stack>
				</Center>
			</Wrapper>
		</>
	);
};
