import { createStyles, Container, Group, ActionIcon, Text } from "@mantine/core";
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from "@tabler/icons";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
	footer: {
		marginTop: 120,
		borderTop: `1px solid ${theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]}`,
	},

	inner: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: theme.spacing.xl,
		paddingBottom: theme.spacing.xl,

		[theme.fn.smallerThan("xs")]: {
			flexDirection: "column",
		},
	},

	links: {
		[theme.fn.smallerThan("xs")]: {
			marginTop: theme.spacing.md,
		},
	},
}));

export function FooterWeb() {
	const { classes } = useStyles();

	return (
		<footer className={classes.footer + " footer"}>
			<Container className={classes.inner}>
				<Group spacing={0} className={classes.links}>
					<span className="subtle-link">
						<ActionIcon size="lg">
							<IconBrandTwitter size={18} stroke={1.5} />
						</ActionIcon>
					</span>
					<span className="subtle-link">
						<ActionIcon size="lg">
							<IconBrandYoutube size={18} stroke={1.5} />
						</ActionIcon>
					</span>
					<span className="subtle-link">
						<ActionIcon size="lg">
							<IconBrandInstagram size={18} stroke={1.5} />
						</ActionIcon>
					</span>
				</Group>
				<span className="subtle-link pointer" style={{ marginTop: "1rem" }}>
					<Link href={"https://github.com/Dadangdut33"}>
						<Text component="a" color={"#2978b5"} style={{ textDecoration: "none" }} weight={550} size={16}>
							© 2022 Dadangdut33
						</Text>
					</Link>
				</span>
			</Container>
		</footer>
	);
}
