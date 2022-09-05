import { useEffect, useState } from "react";
import { createStyles, Header, Container, Group, Burger, Paper, Transition, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { ColorSchemeToggle } from "../Looks/ColorSchemeToggle";
import Link from "next/link";

const HEADER_HEIGHT = 60;
const useStyles = createStyles((theme) => ({
	root: {
		position: "relative",
		zIndex: 1,
	},

	dropdown: {
		position: "absolute",
		top: HEADER_HEIGHT,
		left: 0,
		right: 0,
		zIndex: 0,
		borderTopRightRadius: 0,
		borderTopLeftRadius: 0,
		borderTopWidth: 0,
		overflow: "hidden",

		[theme.fn.largerThan("sm")]: {
			display: "none",
		},
	},

	header: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		height: "100%",
	},

	links: {
		[theme.fn.smallerThan("sm")]: {
			display: "none",
		},
	},

	burger: {
		[theme.fn.largerThan("sm")]: {
			display: "none",
		},
	},

	link: {
		display: "block",
		lineHeight: 1,
		padding: "8px 12px",
		borderRadius: theme.radius.sm,
		textDecoration: "none",
		color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
		fontSize: theme.fontSizes.sm,
		fontWeight: 500,

		"&:hover": {
			backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.colors.gray[0],
		},

		[theme.fn.smallerThan("sm")]: {
			borderRadius: 0,
			padding: theme.spacing.md,
		},
	},

	linkActive: {
		"&, &:hover": {
			backgroundColor: theme.fn.variant({ variant: "light", color: theme.primaryColor }).background,
			color: theme.fn.variant({ variant: "light", color: theme.primaryColor }).color,
		},
	},
}));

export function HeaderResponsive() {
	const [opened, { toggle }] = useDisclosure(false);
	const [active, setActive] = useState<string | null>(null);
	const { classes, cx } = useStyles();
	const router = useRouter();

	const links = [
		{ link: "/", label: "About" },
		{ link: "/project", label: "Projects" },
		{ link: "/blog", label: "Blog" },
	];

	const items = links.map((link) => (
		<span className="subtle-link" key={link.label}>
			<Link href={link.link}>
				<a className={cx(classes.link, { [classes.linkActive]: active === link.link })}>{link.label}</a>
			</Link>
		</span>
	));

	useEffect(() => {
		// set active based on url
		const path = router.pathname;
		const activeLink = links.find((link) => link.link === path);

		if (activeLink) setActive(activeLink.link);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Header height={HEADER_HEIGHT} className={classes.root}>
			<Container className={classes.header}>
				<span className="subtle-link">
					<Link href={"/"}>
						<a>
							<Title order={4}>Dadangdut33</Title>
						</a>
					</Link>
				</span>
				<Group spacing={5} className={classes.links}>
					{items}
					<ColorSchemeToggle />
				</Group>

				<Group spacing={4} className={classes.burger}>
					<ColorSchemeToggle />
					<Burger opened={opened} onClick={toggle} size="sm" />
				</Group>

				<Transition transition="pop-top-right" duration={200} mounted={opened}>
					{(styles) => (
						<Paper className={classes.dropdown} withBorder style={styles}>
							{items}
						</Paper>
					)}
				</Transition>
			</Container>
		</Header>
	);
}
