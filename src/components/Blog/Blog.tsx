import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { Center, Title, Stack, SimpleGrid, LoadingOverlay, Text } from "@mantine/core";
import { Wrapper } from "../Utils/Template/Wrapper";
import { SERVER_V1 } from "../../helper";
import { IBlog } from "../../interfaces/db";
import { BlogCard } from "./BlogCard";

const title = "Blog | Dadangdut33",
	desc = "Place where I share thoughts, ideas, and experiences that might be useful in your coding adventure";

export const Blog: NextPage = (props) => {
	const [posts, setPosts] = useState<IBlog[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadFail, setLoadFail] = useState(false);
	const [failMsg, setFailMsg] = useState("");
	const [maxCol, setMaxCol] = useState(1);

	const fetchData = async () => {
		setLoading(true);
		try {
			const req = await fetch(SERVER_V1 + "/blog", {
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
				setLoadFail(false);
				setPosts(res.data);

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

	useEffect(() => {
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
								Blog
							</Title>
						</Center>
						<Text mx={"auto"} sx={{ maxWidth: "300px", width: "95%" }} className="center-text">
							Place where I share thoughts, ideas, and experiences that might be useful in your coding adventure
						</Text>
						<Center className="relative" mt={"md"}>
							<LoadingOverlay visible={loading} overlayBlur={3} />
							<SimpleGrid
								cols={2}
								sx={{ width: "95%" }}
								breakpoints={[
									{ maxWidth: "sm", cols: 2, spacing: "sm" },
									{ maxWidth: "xs", cols: 1, spacing: "sm" },
								]}
								spacing="lg"
							>
								{posts.length > 0 ? (
									<>
										{posts.map((post) => (
											<BlogCard
												key={post._id}
												_id={post._id}
												image={post.thumbnail ? post.thumbnail : "/assets/no-image.png"}
												title={post.title}
												desc={post.description}
												tags={post.tags ? post.tags : []}
											/>
										))}{" "}
										{posts.map((post) => (
											<BlogCard
												key={post._id}
												_id={post._id}
												image={post.thumbnail ? post.thumbnail : "/assets/no-image.png"}
												title={post.title}
												desc={post.description}
												tags={post.tags ? post.tags : []}
											/>
										))}
									</>
								) : (
									<>
										{loadFail ? (
											<BlogCard title="Fail to Load" desc={failMsg} tags={[]} _id={failMsg} image={"/assets/no-image.png"} btnReloadFunction={() => fetchData()} />
										) : (
											<Center>
												<Text>No post yet.</Text>
											</Center>
										)}
									</>
								)}
							</SimpleGrid>
						</Center>
					</Stack>
				</Center>
			</Wrapper>
		</>
	);
};
