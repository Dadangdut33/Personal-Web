import { Center, Title, Card, Text, Stack, Button, ActionIcon, createStyles, Badge, ScrollArea } from "@mantine/core";
import { motion } from "framer-motion";
import Link from "next/link";
import { linkIcon } from "../../interfaces/db";
import { iconMap } from "../Admin/Project";

const useStyles = createStyles((theme) => ({
	cardLinks: {
		position: "absolute",
		bottom: "10px",
		left: 0,
		right: 0,
		marginLeft: "auto",
		marginRight: "auto",
		textAlign: "center",
	},
}));

interface IProjectCardProps {
	title: string;
	desc: string;
	tags: string[];
	links: linkIcon[];
	btnReloadFunction?: () => void;
}

export const BlogCard = ({ title, desc, links, tags, btnReloadFunction }: IProjectCardProps) => {
	const { classes } = useStyles();

	return (
		<motion.div whileHover={{ y: "-7px", transition: { duration: 0.2 } }}>
			<Card shadow="lg" p="lg" radius="md" withBorder sx={{ maxWidth: "350px" }} className="relative">
				<Stack justify="space-between">
					<Stack>
						<Center mb={"xs"}>
							<Title order={5}>{title}</Title>
						</Center>

						<Center mb={"xs"}>
							<Text size="sm" color="dimmed" className="center-text">
								{desc}
							</Text>
						</Center>

						<ScrollArea type="hover" scrollHideDelay={300} scrollbarSize={6} mb="1.5rem">
							<Center mb={"sm"}>
								{tags.map((tag) => (
									<Badge key={tag} mx={4}>
										{tag}
									</Badge>
								))}
							</Center>
						</ScrollArea>
					</Stack>

					<Center className={classes.cardLinks}>
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

					{btnReloadFunction && (
						<Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={btnReloadFunction}>
							Reload
						</Button>
					)}
				</Stack>
			</Card>
		</motion.div>
	);
};
