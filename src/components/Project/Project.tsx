import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { Center, Title, Card, Text, Button, Stack, SimpleGrid } from "@mantine/core";
import { Wrapper } from "../Utils/Template/Wrapper";

const title = "Projects | Dadangdut33",
	desc = "Showcase of some of my projects or things that i have made on my free time";

export const Project: NextPage = (props) => {
	const [projects, setProjects] = useState([]);

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
						<Center>
							<SimpleGrid cols={3} sx={{ width: "95%" }}>
								<Card shadow="lg" p="lg" radius="md" withBorder sx={{ maxWidth: "320px" }}>
									<Center mb={"xs"}>
										<Title order={4}>A Title</Title>
									</Center>

									<Text size="sm" color="dimmed" className="justify-text">
										With Fjord Tours you can explore more of the magical fjord landscapes with tours and activities on and around the fjords of Norway
									</Text>

									<Button variant="light" color="blue" fullWidth mt="md" radius="md">
										Book classic tour now
									</Button>
								</Card>
							</SimpleGrid>
						</Center>
					</Stack>
				</Center>
			</Wrapper>
		</>
	);
};
