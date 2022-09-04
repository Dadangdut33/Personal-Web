import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Navbar, Center, Tooltip, createStyles, Stack, useMantineColorScheme, Menu, ActionIcon, useMantineTheme, MantineTheme, Skeleton } from "@mantine/core";
import {
	IconSun,
	IconMoonStars,
	TablerIcon,
	IconHome2,
	IconNotebook,
	IconLink,
	IconUser,
	IconNote,
	IconLogout,
	IconDashboard,
	IconCirclePlus,
	IconTags,
	IconList,
	IconHistory,
	IconDeviceLaptop,
	IconReplace,
} from "@tabler/icons";
import { IDashboardProps } from "../../../interfaces/props/Dashboard";
import { UserPopout } from "./Userpopout";

const useStyles = createStyles((theme) => ({
	link: {
		width: 50,
		height: 50,
		borderRadius: theme.radius.md,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
		cursor: "pointer",

		"&:hover": {
			backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[0],
		},
	},

	active: {
		"&, &:hover": {
			backgroundColor: theme.fn.variant({ variant: "light", color: theme.primaryColor }).background,
			color: theme.fn.variant({ variant: "light", color: theme.primaryColor }).color,
		},
	},
}));

interface NavbarLinkProps {
	icon: TablerIcon;
	label: string;
	active?: boolean;
	disabled?: boolean;
	onClick?(): void;
}

const NavbarLink = ({ icon: Icon, label, active, disabled, onClick }: NavbarLinkProps) => {
	const { classes, cx } = useStyles();
	return (
		<Tooltip label={label} position="right" transitionDuration={0} disabled={disabled || false}>
			<div onClick={onClick} className={cx(classes.link, { [classes.active]: active })}>
				<Icon stroke={1.5} />
			</div>
		</Tooltip>
	);
};

const blogMenu = (theme: MantineTheme, _type: string) => {
	return (
		<Menu.Dropdown>
			<Menu.Label>Blog</Menu.Label>
			<Link href={`/admin/blog`}>
				<a>
					<Menu.Item icon={<IconList size={14} stroke={1.5} color={theme.colors.grape[6]} />}>Blog posts</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/blog/create`}>
				<a>
					<Menu.Item icon={<IconCirclePlus size={14} stroke={1.5} color={theme.colors.red[6]} />}>Create new Post</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/blog/revision`}>
				<a>
					<Menu.Item icon={<IconHistory size={14} stroke={1.5} color={theme.colors.grape[6]} />}>Revisions</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/blog/tags`}>
				<a>
					<Menu.Item icon={<IconTags size={14} stroke={1.5} color={theme.colors.yellow[6]} />}>Tags</Menu.Item>
				</a>
			</Link>
		</Menu.Dropdown>
	);
};

const projectMenu = (theme: MantineTheme, _type: string) => {
	return (
		<Menu.Dropdown>
			<Menu.Label>Project</Menu.Label>
			<Link href={`/admin/project`}>
				<a>
					<Menu.Item icon={<IconList size={14} stroke={1.5} color={theme.colors.grape[6]} />}>Projects</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/project/create`}>
				<a>
					<Menu.Item icon={<IconCirclePlus size={14} stroke={1.5} color={theme.colors.red[6]} />}>Add Project</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/project/tags`}>
				<a>
					<Menu.Item icon={<IconTags size={14} stroke={1.5} color={theme.colors.yellow[6]} />}>Tags</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/project/order`}>
				<a>
					<Menu.Item icon={<IconReplace size={14} stroke={1.5} color={theme.colors.blue[6]} />}>Order</Menu.Item>
				</a>
			</Link>
		</Menu.Dropdown>
	);
};

const genericMenu = (theme: MantineTheme, type: string) => {
	return (
		<Menu.Dropdown>
			<Menu.Label>{type}</Menu.Label>
			<Link href={`/admin/${type.toLowerCase()}`}>
				<a>
					<Menu.Item icon={<IconList size={14} stroke={1.5} color={theme.colors.grape[6]} />}>{type}s</Menu.Item>
				</a>
			</Link>
			<Link href={`/admin/${type.toLowerCase()}/create`}>
				<a>
					<Menu.Item icon={<IconCirclePlus size={14} stroke={1.5} color={theme.colors.red[6]} />}>Create new {type}</Menu.Item>
				</a>
			</Link>
		</Menu.Dropdown>
	);
};

const navData = [
	{ icon: IconDashboard, label: "Dashboard Home", path: "/admin", disabled: false },
	{ icon: IconNotebook, label: "Blog", path: "/admin/blog", menuItem: blogMenu, disabled: true },
	{ icon: IconDeviceLaptop, label: "Project", path: "/admin/project", menuItem: projectMenu, disabled: true },
	{ icon: IconLink, label: "Shortlink", path: "/admin/shortlink", menuItem: genericMenu, disabled: true },
	{ icon: IconNote, label: "Note", path: "/admin/note", menuItem: genericMenu, disabled: true },
	{ icon: IconUser, label: "User", path: "/admin/user", menuItem: genericMenu, disabled: true },
];

export const DashboardNav: NextPage<IDashboardProps> = (props) => {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	const theme = useMantineTheme();
	const [active, setActive] = useState(navData.findIndex((data) => data.path.includes(props.pathname!.split("?")[0])));
	const [links, setLinks] = useState<JSX.Element[] | null>(null);

	useEffect(() => {
		setLinks(
			navData.map((link, index) => {
				return (
					<Menu width={300} position="right" transition="pop" trigger="hover" key={link.path}>
						<Link href={link.path}>
							<a>
								<Menu.Target>
									<ActionIcon size={50} sx={{ display: "flex", flexDirection: "column" }}>
										<NavbarLink onClick={() => setActive(index)} {...link} active={index === active} />
									</ActionIcon>
								</Menu.Target>
							</a>
						</Link>
						{link.menuItem ? link.menuItem(theme, link.label) : null}
					</Menu>
				);
			})
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Navbar p="md" width={{ base: 80 }} sx={{ position: "sticky", top: "0" }}>
			<Center>
				<UserPopout {...props} theme={theme} />
			</Center>
			<Navbar.Section grow mt={50} sx={{ position: "relative" }}>
				{links ? (
					<Stack justify="center" spacing={0}>
						{links}
					</Stack>
				) : (
					<Skeleton visible={true} height={450} />
				)}
			</Navbar.Section>
			<Navbar.Section>
				<Stack justify="center" spacing={0}>
					<NavbarLink
						onClick={() => toggleColorScheme()}
						icon={colorScheme === "dark" ? IconSun : IconMoonStars}
						label={`Switch theme to ${colorScheme === "dark" ? "light" : "dark"} mode`}
					/>
					<Link href="/auth/logout">
						<a id="logout-nav">
							<NavbarLink icon={IconLogout} label="Logout" />
						</a>
					</Link>
					<Link href="/">
						<a>
							<NavbarLink icon={IconHome2} label="Go to home page" />
						</a>
					</Link>
				</Stack>
			</Navbar.Section>
		</Navbar>
	);
};
