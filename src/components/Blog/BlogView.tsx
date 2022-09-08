import { Center, Stack, TypographyStylesProvider, Title, useMantineColorScheme, useMantineTheme, Group, Text, Button, Badge, Tooltip, CopyButton, ActionIcon } from "@mantine/core";
import { IconCalendar, IconEye, IconHome, IconBrandReddit, IconBrandTwitter, IconBrandFacebook, IconCheck, IconLink } from "@tabler/icons";
import { RedditShareButton, TwitterShareButton, FacebookShareButton } from "react-share";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IBlog } from "../../interfaces/db";
import { Wrapper } from "../Utils/Template/Wrapper";
import { ReactMD } from "../Utils/Viewer/Markdown/ReactMD";
import { formatDateWithTz } from "../../helper";
import { NoScrollLink } from "../Utils/Looks/NoScrollLink";
// @ts-ignore
import ProgressBar from "react-scroll-progress-bar";

interface IBV {
	post?: IBlog;
}

export const BlogView: NextPage<IBV> = ({ post }) => {
	const { colorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const [views, setViews] = useState(0);
	const [tz, setTz] = useState("UTC");

	const { asPath } = useRouter();
	const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : "";
	const URL = `${origin}${asPath}`;

	useEffect(() => {
		setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
				<ProgressBar bgcolor={colorScheme === "dark" ? theme.colors.yellow[4] : theme.colors.grape[4]} duration="1.5" />
				<Stack mt={"xl"}>
					<Stack className="post-title-wrapper center-text">
						<NoScrollLink href="/blog">
							<a>
								<Button variant="outline" className="w-95">
									<IconHome />
									Go back to blog posts
								</Button>
							</a>
						</NoScrollLink>
						<picture>
							<img className="post-thumbnail" src={post?.thumbnail ? post.thumbnail : "/assets/no-image.png"} alt={`${post?.title} thumbnail`} />
						</picture>
						<Title order={4}>{post?.title}</Title>
						<Center>
							<Group spacing="xs">
								<Group spacing={2}>
									<IconCalendar size={14} />
									<Text color="dimmed" size={14}>
										{formatDateWithTz(post?.createdAt!, tz)}
									</Text>
								</Group>
								<Group spacing={2}>
									<IconEye size={14} />
									<Text color="dimmed" size={14}>
										{views}
									</Text>
								</Group>
							</Group>
						</Center>
					</Stack>

					<div className="md-wrapper mx-auto">
						<TypographyStylesProvider>
							<ReactMD content={post?.content!} className="md-body mx-auto" />
						</TypographyStylesProvider>
					</div>

					<Stack spacing={2}>
						<Group className="post-title-wrapper">
							{post?.tags?.map((tag) => (
								<NoScrollLink key={tag} href={`../blog?q=[${tag}]`}>
									<a>
										<Badge className="pointer">{tag}</Badge>
									</a>
								</NoScrollLink>
							))}
						</Group>
						<Group className="post-title-wrapper">
							<Tooltip label="Copy URL">
								<CopyButton value={URL} timeout={2000}>
									{({ copied, copy }) => (
										<Tooltip label={copied ? "Copied" : "Copy"}>
											<ActionIcon color={copied ? "teal" : "gray"} onClick={copy} className="hover-effect">
												{copied ? <IconCheck /> : <IconLink />}
											</ActionIcon>
										</Tooltip>
									)}
								</CopyButton>
							</Tooltip>
							<Tooltip label="Share to reddit">
								<RedditShareButton url={URL} title={post?.title} className="hover-effect">
									<IconBrandReddit />
								</RedditShareButton>
							</Tooltip>
							<Tooltip label="Share to twitter">
								<TwitterShareButton url={URL} title={post?.title} hashtags={post?.tags} className="hover-effect">
									<IconBrandTwitter />
								</TwitterShareButton>
							</Tooltip>
							<Tooltip label="Share to facebook">
								<FacebookShareButton url={URL} quote={post?.description} className="hover-effect">
									<IconBrandFacebook />
								</FacebookShareButton>
							</Tooltip>
						</Group>
					</Stack>
				</Stack>
			</Wrapper>
		</>
	);
};
