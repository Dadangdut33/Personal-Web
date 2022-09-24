import { Card, Text, Button, createStyles, Badge, Image, Group } from "@mantine/core";
import { IconEye, IconCalendar, IconThumbUp } from "@tabler/icons";
import { NoScrollLink } from "../Utils/Looks/NoScrollLink";
import { formatDateDayNameWithTz } from "../../helper";

const useStyles = createStyles((theme) => ({
	card: {
		maxWidth: "350px",
		transition: "transform 200ms ease, box-shadow 100ms ease",
		"&:hover": {
			transform: "scale(1.02)",
		},
	},

	section: {
		borderBottom: `1px solid ${theme.colorScheme === "dark" ? "#3b4060" : theme.colors.gray[3]}`,
		paddingLeft: theme.spacing.md,
		paddingRight: theme.spacing.md,
		paddingBottom: theme.spacing.md,
	},

	like: {
		color: theme.colors.red[6],
	},

	view: {
		color: theme.colors.blue[6],
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
	createdAt?: Date;
	tz: string;
	views?: number;
	likes?: number;
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
	views,
	likes,
	search = "",
	btnReloadFunction,
	setSearchFunction = (search: string) => {},
	setSearching = (searching: boolean) => {},
}: IProjectCardProps) => {
	const { classes, theme } = useStyles();
	const link = "/blog/" + title.replace(/ /g, "-") + "-" + _id;

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

	return (
		<Card shadow="lg" withBorder radius="md" p="md" className={classes.card}>
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
						{createdAt && (
							<Badge size="sm" mt={"sm"} className="pointer">
								<Group spacing={4}>
									<IconCalendar size={13} />
									<Text>{formatDateDayNameWithTz(createdAt, tz)}</Text>
								</Group>
							</Badge>
						)}
						{views !== undefined && (
							<Badge size="sm" mt={"sm"} className="pointer">
								<Group spacing={4}>
									<IconEye size={13} className={classes.view} />
									<Text>{views}</Text>
								</Group>
							</Badge>
						)}
						{likes !== undefined && (
							<Badge size="sm" mt={"sm"} className="pointer">
								<Group spacing={4}>
									<IconThumbUp size={13} className={classes.like} />
									<Text>{likes}</Text>
								</Group>
							</Badge>
						)}
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
	);
};
