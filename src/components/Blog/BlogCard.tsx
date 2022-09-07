import { Center, Title, Card, Text, Stack, Button, ActionIcon, createStyles, Badge, ScrollArea, Image, Group } from "@mantine/core";
import { motion } from "framer-motion";
import { IconHeart } from "@tabler/icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NoScrollLink } from "../Utils/Looks/NoScrollLink";

const useStyles = createStyles((theme) => ({
	card: {
		backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
		maxWidth: "350px",
	},

	section: {
		borderBottom: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]}`,
		paddingLeft: theme.spacing.md,
		paddingRight: theme.spacing.md,
		paddingBottom: theme.spacing.md,
	},

	like: {
		color: theme.colors.red[6],
	},

	label: {
		textTransform: "uppercase",
		fontSize: theme.fontSizes.xs,
		fontWeight: 700,
	},
}));

interface IProjectCardProps {
	_id: string;
	image: string;
	title: string;
	desc: string;
	tags: string[];
	btnReloadFunction?: () => void;
}

export const BlogCard = ({ _id, image, title, desc, tags, btnReloadFunction }: IProjectCardProps) => {
	const { classes, theme } = useStyles();
	const [views, setViews] = useState(0);
	const link = title.replace(/ /g, "-") + "-" + _id;

	const features = tags.map((tag) => (
		<Badge color={theme.colorScheme === "dark" ? "dark" : "gray"} key={tag}>
			{tag}
		</Badge>
	));

	useEffect(() => {
		// TODO: fetch views from analytics...
	}, []);

	return (
		<Card withBorder radius="md" p="md" className={classes.card}>
			<NoScrollLink passHref href={link}>
				<Card.Section component="a">
					<Image src={image} alt={title} height={180} />
				</Card.Section>
			</NoScrollLink>

			<NoScrollLink passHref href={link}>
				<Card.Section component="a" className={classes.section} mt="md">
					<Group position="apart">
						<Title order={5}>{title}</Title>
						<Badge size="sm">{views} views</Badge>
					</Group>
					<Text size="sm" mt="xs">
						{desc}
					</Text>
				</Card.Section>
			</NoScrollLink>

			<Card.Section className={classes.section}>
				<Group spacing={7} mt={"md"}>
					{features}
				</Group>
			</Card.Section>

			{btnReloadFunction && (
				<Group mt="xs">
					<Button radius="md" style={{ flex: 1 }} onClick={btnReloadFunction}>
						Reload
					</Button>
				</Group>
			)}
		</Card>
	);
};
