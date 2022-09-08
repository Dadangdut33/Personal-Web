import { Center, Stack, TypographyStylesProvider, Title } from "@mantine/core";
import { NextPage } from "next";
import Head from "next/head";
import { IBlog } from "../../interfaces/db";
import { Wrapper } from "../Utils/Template/Wrapper";
import { MDPreview } from "../Utils/Viewer/Markdown/MDPreview";

interface IBV {
	post?: IBlog;
}

export const BlogView: NextPage<IBV> = ({ post }) => {
	const pTitle = post?.title + " - Dadangdut33";
	return (
		<>
			<Head>
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" href="/logo192.png" />

				<title>{pTitle}</title>

				<meta name="title" content={pTitle} />
				<meta name="description" content={post?.description} />
				<meta name="keywords" content={post?.tags?.join(", ")} />
				<meta name="author" content={post?.author[0].username + ` (${post?.author[0].first_name} ${post?.author[0].last_name})`} />

				<meta property="og:title" content={pTitle} />
				<meta property="og:description" content={post?.description} />
				<meta property="og:image" content={post?.thumbnail} />
				<meta property="og:url" content="https://dadangdut33.codes/[pId]" />
				<meta property="og:type" content="website" />
				<meta property="og:site_name" content="Dadangdut33" />
				<meta property="og:locale" content="en_US" />
				<meta property="article:published_time" content={post?.createdAt.toString()} />

				<meta property="twitter:card" content="summary" />
				<meta property="twitter:creator" content="@dadangdut33" />
				<meta property="twitter:title" content={pTitle} />
				<meta property="twitter:url" content="https://dadangdut33.codes/[pId]" />
				<meta property="twitter:description" content={post?.description} />
				<meta property="twitter:image" content={post?.thumbnail} />
			</Head>

			<Wrapper activeLinkProp="/blog">
				<Stack mt={"xl"}>
					<Stack className="post-title-wrapper">
						<picture>
							<img className="post-thumbnail" src={post?.thumbnail ? post.thumbnail : "/assets/no-image.png"} alt={`${post?.title} thumbnail`} />
						</picture>
						<Title order={4}>{post?.title}</Title>
					</Stack>

					<div className="md-wrapper mx-auto">
						<TypographyStylesProvider>
							<MDPreview content={post?.content!} className="md-body mx-auto justify-text" />
						</TypographyStylesProvider>
					</div>
				</Stack>
			</Wrapper>
		</>
	);
};
