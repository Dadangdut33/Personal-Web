import { createStyles, Container, Group, ActionIcon, Text } from "@mantine/core";
import { IconCoffee, IconBrandGithub, IconBrandLinkedin, IconMail } from "@tabler/icons";
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
				<Group spacing={8} className={classes.links}>
					<span className="subtle-link">
						<Link href={"https://www.linkedin.com/in/fauzan-farhan-antoro/"} passHref>
							<ActionIcon size="lg" component="a" target="_blank" rel="noopener noreferrer">
								<IconBrandLinkedin stroke={1.5} />
							</ActionIcon>
						</Link>
					</span>
					<span className="subtle-link">
						<Link href={"https://github.com/Dadangdut33/"} passHref>
							<ActionIcon size="lg" component="a" target="_blank" rel="noopener noreferrer">
								<IconBrandGithub stroke={1.5} />
							</ActionIcon>
						</Link>
					</span>
					<span className="subtle-link">
						<Link href={"mailto:contact@dadangdut33.codes"} passHref>
							<ActionIcon size="lg" component="a">
								<IconMail stroke={1.5} />
							</ActionIcon>
						</Link>
					</span>
					<span className="subtle-link">
						<Link href={"https://ko-fi.com/dadangdut33"} passHref>
							<ActionIcon size="lg" component="a" target="_blank" rel="noopener noreferrer">
								<IconCoffee stroke={1.5} />
							</ActionIcon>
						</Link>
					</span>
				</Group>
				<span className="subtle-link pointer" style={{ marginTop: "1rem" }}>
					<Link href={"https://github.com/Dadangdut33/Personal-Web"} passHref>
						<Text component="a" color={"#2978b5"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }} weight={550} size={16}>
							© 2022 Dadangdut33
						</Text>
					</Link>
				</span>
			</Container>
		</footer>
	);
}
