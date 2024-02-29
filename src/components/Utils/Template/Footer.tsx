import { createStyles, Container, Group, ActionIcon, Text, Tooltip } from "@mantine/core";
import { IconCoffee, IconBrandGithub, IconBrandLinkedin, IconMail, IconDeviceAnalytics } from "@tabler/icons";
import Link from "next/link";
import { analyticsPublicId, domain, umami_public_link } from "../../../helper";

const useStyles = createStyles((theme) => ({
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
	const currentYear = new Date().getFullYear();

	return (
		<footer className={"footer"}>
			<Container className={classes.inner}>
				<Group spacing={8} className={classes.links}>
					<Tooltip label="See my profile at Linkedin" position="top" color={"blue"} transition="skew-down" withArrow>
						<span className="subtle-link">
							<Link href={"https://www.linkedin.com/in/fauzan-farhan-antoro/"} passHref>
								<ActionIcon size="lg" component="a" target="_blank" rel="noopener noreferrer">
									<IconBrandLinkedin stroke={1.5} />
								</ActionIcon>
							</Link>
						</span>
					</Tooltip>
					<Tooltip label="Follow me on Github" position="top" color={"blue"} transition="skew-down" withArrow>
						<span className="subtle-link">
							<Link href={"https://github.com/Dadangdut33/"} passHref>
								<ActionIcon size="lg" component="a" target="_blank" rel="noopener noreferrer">
									<IconBrandGithub stroke={1.5} />
								</ActionIcon>
							</Link>
						</span>
					</Tooltip>
					<Tooltip label="Contact me via email" position="top" color={"blue"} transition="skew-down" withArrow>
						<span className="subtle-link">
							<Link href={`mailto:dadang.contact@gmail.com`} passHref>
								<ActionIcon size="lg" component="a">
									<IconMail stroke={1.5} />
								</ActionIcon>
							</Link>
						</span>
					</Tooltip>
					<Tooltip label="Buy me a coffee" position="top" color={"blue"} transition="skew-down" withArrow>
						<span className="subtle-link">
							<Link href={"https://ko-fi.com/dadangdut33"} passHref>
								<ActionIcon size="lg" component="a" target="_blank" rel="noopener noreferrer">
									<IconCoffee stroke={1.5} />
								</ActionIcon>
							</Link>
						</span>
					</Tooltip>
					{/* analytics umami */}
					<Tooltip label="See web analytics" position="top" color={"blue"} transition="skew-down" withArrow>
						<span className="subtle-link">
							<Link href={umami_public_link} passHref>
								<ActionIcon size="lg" component="a" target="_blank" rel="noopener noreferrer">
									<IconDeviceAnalytics stroke={1.5} />
								</ActionIcon>
							</Link>
						</span>
					</Tooltip>
				</Group>
				<Tooltip label="Made with ❤️ by Dadangdut33" color={"blue"} transition="pop" withArrow>
					<span style={{ marginTop: "1rem" }}>
						<Link href={"https://github.com/Dadangdut33/Personal-Web"} passHref>
							<Text component="a" color={"#2978b5"} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }} weight={550} size={16}>
								© 2022 - {currentYear} Dadangdut33
							</Text>
						</Link>
					</span>
				</Tooltip>
			</Container>
		</footer>
	);
}
