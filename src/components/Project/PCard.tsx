import { Center, Title, Card, Text, Stack, Button, ActionIcon, createStyles, Badge, ScrollArea } from "@mantine/core";
import Link from "next/link";
import { linkIcon } from "../../interfaces/db";
import { iconMap } from "../Admin/Project";

const useStyles = createStyles((theme) => ({
	card: {
		maxWidth: "350px",
		transition: "transform 200ms ease, box-shadow 100ms ease",
		"&:hover": {
			transform: "translateY(-5px)",
		},
	},
	cardLinks: {
		position: "absolute",
		bottom: "10px",
		left: 0,
		right: 0,
		marginLeft: "auto",
		marginRight: "auto",
	},
}));

interface IProjectCardProps {
	title: string;
	desc: string;
	tags: string[];
	links: linkIcon[];
	btnReloadFunction?: () => void;
}

export const PCard = ({ title, desc, links, tags, btnReloadFunction }: IProjectCardProps) => {
	const { classes } = useStyles();

	return (
		<Card shadow="lg" p="lg" radius="md" withBorder className={classes.card + " relative"}>
			<Stack justify="space-between">
				<Stack mb="4rem">
					<Center mb={"xs"}>
						<Title order={5} className="center-text">
							{title}
						</Title>
					</Center>

					<Center mb={"xs"}>
						<Text size="sm" color="dimmed" className="center-text">
							{desc}
						</Text>
					</Center>
				</Stack>

				<Stack className={classes.cardLinks} spacing={0}>
					<div style={{ padding: "0 1rem" }}>
						<ScrollArea type="hover" scrollHideDelay={300} scrollbarSize={6}>
							<Center mb={"sm"}>
								{tags.map((tag) => (
									<Badge key={tag} mx={4}>
										{tag}
									</Badge>
								))}
							</Center>
						</ScrollArea>
					</div>

					<Center>
						{links &&
							links.length > 0 &&
							links.map((links) => {
								const LinkIcon = iconMap[links.type];
								return (
									<span className="subtle-link" key={links.url}>
										<Link href={links.url} passHref>
											<ActionIcon size="lg" component="a" target="_blank" rel="noopener noreferrer">
												<LinkIcon stroke={1.5} />
											</ActionIcon>
										</Link>
									</span>
								);
							})}
					</Center>
				</Stack>

				{btnReloadFunction && (
					<Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={btnReloadFunction}>
						Reload
					</Button>
				)}
			</Stack>
		</Card>
	);
};
