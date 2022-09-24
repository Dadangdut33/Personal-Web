import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import { IconSearch, IconChevronDown, IconChevronUp } from "@tabler/icons";
import { Center, Title, Stack, SimpleGrid, LoadingOverlay, Text, Collapse, TextInput, ActionIcon } from "@mantine/core";
import { keys } from "@mantine/utils";
import { Wrapper } from "../Utils/Template/Wrapper";
import { formatDateWithTz, handleInputQueryChange, SERVER_V1 } from "../../helper";
import { IBlog } from "../../interfaces/db";
import { BlogCard } from "./BlogCard";
import { useRouter } from "next/router";

const title = "Blog - Dadangdut33",
	desc = "Place where I share thoughts, ideas, and experiences that might be useful in your coding adventure";

export interface BlogPageProps {
	success: boolean;
	data: IBlog[];
	msg: string;
}

export const Blog: NextPage<BlogPageProps> = (props) => {
	// data
	const [useSSR, setUseSSR] = useState(true);
	const [postsCSR, setPostsCSR] = useState<IBlog[]>([]);

	// fetch
	const [successLoad, setSuccessLoad] = useState(true);
	const [loading, setLoading] = useState(false);
	const [failMsg, setFailMsg] = useState("");
	const [maxCol, setMaxCol] = useState(1);

	// search
	const [search, setSearch] = useState("");
	const [openSearch, setOpenSearch] = useState(false);
	const [tz, setTz] = useState("UTC");
	const router = useRouter();

	// --------------------------------------------------
	const maxColCheck = (len: number) => {
		if (len <= 1) return 1;
		else if (len % 2 === 0) return 2;
		else return 3;
	};

	const searchAllHelper = (item: IBlog, query: string) => {
		return (
			item.title.toLowerCase().includes(query.toLowerCase()) ||
			item.author[0]?.username.toLowerCase().includes(query.toLowerCase()) ||
			item.tags?.join(" ").toLowerCase().includes(query.toLowerCase()) ||
			item.visibility.toLowerCase().includes(query.toLowerCase()) ||
			formatDateWithTz(item.createdAt, tz).toLowerCase().includes(query.toLowerCase())
		);
	};

	const searchHandler = (postList: IBlog[], query: string) => {
		if (query === "") return postList;
		else {
			let filtered = postList;
			// check for tags
			// tags are formatted between brackets like this: [tagname][tagname]
			const tagsQ = query.match(/\[(.*?)\]/g);
			if (tagsQ) {
				tagsQ.forEach((tag) => {
					query = query.replace(tag, "");
				});
				// filter by tags get not by query
				filtered = filtered.filter((item) => {
					return item.tags?.some((tag) => tagsQ.includes(`[${tag}]`));
				});
			}

			// filter by query
			return filtered.filter((item) => keys(postList[0]).some(() => searchAllHelper(item, query)));
		}
	};

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
				setSuccessLoad(true);
				setFailMsg(res.message);
			} else {
				setLoading(false);
				setSuccessLoad(false);
				setPostsCSR(res.data);

				setMaxCol(maxColCheck(res.data.length));
			}
		} catch (error: any) {
			setLoading(false);
			setSuccessLoad(true);
			setFailMsg(error.message);
		}
	};

	useEffect(() => {
		if (props.success) {
			setMaxCol(maxColCheck(props.data.length));
			setPostsCSR(props.data);
		} else {
			setUseSSR(false);
			setSuccessLoad(false);
			setFailMsg(props.msg);
		}

		setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
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
				<meta property="og:image" content="/assets/preview.png" />
				<meta property="og:url" content="https://dadangdut33.codes/blog" />
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Dadangdut33" />
				<meta property="og:locale" content="en_US" />

				<meta property="twitter:card" content="summary" />
				<meta property="twitter:creator" content="@dadangdut33" />
				<meta property="twitter:title" content={title} />
				<meta property="twitter:url" content="https://dadangdut33.codes/blog" />
				<meta property="twitter:description" content={desc} />
				<meta property="twitter:image" content="/assets/preview.png" />
				<script async defer data-website-id="de9022cd-16b7-4cb7-917c-956d5ae0dc6e" src="https://analytics.dadangdut33.codes/umami.js"></script>
			</Head>

			<Wrapper>
				<Center>
					<Stack spacing={"sm"}>
						<Center>
							<Title order={1} mt="xl">
								Blog
							</Title>
						</Center>
						<Text size="lg" sx={{ maxWidth: "600px" }} className="mx-auto justify-text w-95">
							I share thoughts, ideas, and experiences that might be useful in your coding adventure. I hope what i write here could help others :)
						</Text>

						<Stack spacing={8}>
							<Center>
								<ActionIcon radius="lg">{openSearch ? <IconChevronUp onClick={() => setOpenSearch(false)} /> : <IconChevronDown onClick={() => setOpenSearch(true)} />}</ActionIcon>
							</Center>

							<Collapse in={openSearch}>
								<div className="mx-auto w-95">
									<TextInput
										placeholder="Search post"
										name="q"
										icon={<IconSearch size={16} stroke={1.5} />}
										value={search}
										onChange={(e) => handleInputQueryChange(e, setSearch, e.target.name, router)}
									/>
								</div>
							</Collapse>
						</Stack>

						<Center className="relative" mt={"md"}>
							<LoadingOverlay visible={loading} overlayBlur={3} />
							<SimpleGrid
								cols={successLoad ? (search.length > 0 ? maxColCheck(searchHandler(postsCSR, search).length) : maxCol) : 1}
								className="mw-95"
								breakpoints={[
									{ maxWidth: "sm", cols: maxCol > 1 ? 2 : maxCol, spacing: "sm" },
									{ maxWidth: "xs", cols: 1, spacing: "sm" },
								]}
								spacing="lg"
							>
								{useSSR ? (
									props.data.length > 0 && searchHandler(props.data, search).length > 0 ? (
										searchHandler(props.data, search).map((post) => (
											<BlogCard
												key={post._id}
												_id={post._id}
												image={post.thumbnail ? post.thumbnail : "/assets/no-image.png"}
												title={post.title}
												desc={post.description}
												tags={post.tags ? post.tags : []}
												createdAt={post.createdAt}
												tz={tz}
												views={0} // TODO: fetch views from analytics and add to the blog list...
												search={search}
												setSearching={setOpenSearch}
												setSearchFunction={setSearch}
											/>
										))
									) : (
										<Center>
											<Text>No post found.</Text>
										</Center>
									)
								) : successLoad ? (
									postsCSR.length > 0 && searchHandler(postsCSR, search).length > 0 ? (
										searchHandler(postsCSR, search).map((post) => (
											<BlogCard
												key={post._id}
												_id={post._id}
												image={post.thumbnail ? post.thumbnail : "/assets/no-image.png"}
												title={post.title}
												desc={post.description}
												tags={post.tags ? post.tags : []}
												createdAt={post.createdAt}
												tz={tz}
												views={0} // TODO: fetch views from analytics and add to the blog list...
												search={search}
												setSearching={setOpenSearch}
												setSearchFunction={setSearch}
											/>
										))
									) : (
										<Center>
											<Text>No post found.</Text>
										</Center>
									)
								) : (
									<BlogCard _id={failMsg} title="Fail to Load" desc={failMsg} tags={[]} tz={tz} image={"/assets/no-image.png"} btnReloadFunction={() => fetchData()} />
								)}
							</SimpleGrid>
						</Center>
					</Stack>
				</Center>
			</Wrapper>
		</>
	);
};
