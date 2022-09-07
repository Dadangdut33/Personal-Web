import { Card, Text, Button, createStyles, Badge, Image, Group } from "@mantine/core";
import { motion } from "framer-motion";
import { IconEye, IconCalendar } from "@tabler/icons";
import { useEffect, useState } from "react";
import { NoScrollLink } from "../Utils/Looks/NoScrollLink";
import { formatDateDayNameWithTz } from "../../helper";

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

	tagHover: {
		"&:hover": {
			backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.gray[2],
		},
	},
}));

interface IProjectCardProps {
	_id: string;
	image: string;
	title: string;
	desc: string;
	tags: string[];
	createdAt: Date;
	tz: string;
	search?: string;
	btnReloadFunction?: () => void;
	setSearchFunction?: (search: string) => void;
	setSearching?: (searching: boolean) => void;
}

export const BlogCard = ({
	_id,
	image,
	title,
	desc,
	tags,
	createdAt,
	tz,
	search = "",
	btnReloadFunction,
	setSearchFunction = (search: string) => {},
	setSearching = (searching: boolean) => {},
}: IProjectCardProps) => {
	const { classes, theme } = useStyles();
	const [views, setViews] = useState(0);
	const link = title.replace(/ /g, "-") + "-" + _id;

	const tagSearch = (tag: string) => {
		setSearching(true);
		// check if tag already in search
		if (search.includes(tag)) {
			// if so, remove it
			setSearchFunction(search.replace(tag, ""));
		} else {
			// if not, add it
			setSearchFunction(tag + search);
		}
	};

	useEffect(() => {
		// TODO: fetch views from analytics...
	}, []);

	return (
		<motion.div whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}>
			<Card withBorder radius="md" p="md" className={classes.card}>
				<Card.Section>
					<NoScrollLink passHref href={link}>
						<a>
							<Image src={image} alt={title} height={180} />
						</a>
					</NoScrollLink>
				</Card.Section>

				<NoScrollLink passHref href={link}>
					<Card.Section component="a" className={classes.section} mt="md">
						<Text size="lg" weight={500}>
							{title}
						</Text>
						<Group spacing={4}>
							<Badge size="sm" mt={"sm"} className="pointer">
								<Group spacing={4}>
									<IconCalendar size={13} />
									<Text>{formatDateDayNameWithTz(createdAt, tz)}</Text>
								</Group>
							</Badge>
							<Badge size="sm" mt={"sm"} className="pointer">
								<Group spacing={4}>
									<IconEye size={13} />
									<Text>{views}</Text>
								</Group>
							</Badge>
						</Group>
						<Text size="sm" mt="xs" color={"dimmed"}>
							{desc}
						</Text>
					</Card.Section>
				</NoScrollLink>

				<Card.Section className={classes.section}>
					<Group spacing={7} mt={"md"}>
						{tags.map((tag) => (
							<Badge
								color={theme.colorScheme === "dark" ? "lime" : "gray"}
								key={tag}
								onClick={() => tagSearch(`[${tag}]`)}
								variant={search.includes(`[${tag}]`) ? "filled" : "outline"}
								className={classes.tagHover + " pointer"}
							>
								{tag}
							</Badge>
						))}
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
		</motion.div>
	);
};
