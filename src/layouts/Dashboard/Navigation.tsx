import { DASHBOARD_PATH, MATCH_MOBILE_MQ } from "@/lib/constants";
import { useProfile } from "@/lib/hooks";
import { AuthSessionUser } from "@/lib/types";
import { ActionIcon, Box, Flex, Group, Loader, ScrollArea, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconChartBar, IconUserCircle, IconX, Icon as TablerIcon } from "@tabler/icons-react";
import { LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { LinksGroup } from "./LinksGroup";
import { Logo } from "./Logo";
import classes from "./Navigation.module.css";
import UserProfileButton from "./UserProfileBtn";
import { RoleType } from "@/lib/db/schema/_enum";
import { useEffect, useState } from "react";

type innerNavLink = {
  label: string;
  link: string;
  icon?: TablerIcon | JSX.Element | LucideIcon;
};
type navLinks = {
  label: string;
  icon: TablerIcon | JSX.Element | LucideIcon;
  link?: string;
  links?: innerNavLink[];
};
type navData = {
  title: string;
  links: navLinks[];
};

const userAppNav: navData[] = [];

const adminAppNav: navData[] = [
  {
    title: "Admin",
    links: [{ label: "Test", icon: IconChartBar, link: `${DASHBOARD_PATH}` }],
  },
];

const baseApp: navData[] = [
  {
    title: "Home",
    links: [
      { label: "Dashboard", icon: IconChartBar, link: `${DASHBOARD_PATH}` },
      { label: "Account", icon: IconUserCircle, link: `${DASHBOARD_PATH}/account` },
    ],
  },
];

const mapRoleToData: Record<RoleType, navData[]> = {
  user: userAppNav,
  admin: adminAppNav,
  super_admin: adminAppNav,
};

type NavigationProps = {
  onClose: () => void;
  user: AuthSessionUser;
};

const Navigation = ({ onClose, user }: NavigationProps) => {
  const pathname = usePathname();
  const match_width_mobile = useMediaQuery(MATCH_MOBILE_MQ);
  const { profile } = useProfile(user.id);
  const [links, setLinks] = useState<JSX.Element[]>([]);

  useEffect(() => {
    const navData = baseApp;
    for (const role of user.role) {
      if (mapRoleToData[role]) {
        navData.push(...mapRoleToData[role]);
      }
    }
    const mapped = navData.map((m) => (
      <Box pl={0} mb="md" key={m.title}>
        <Text tt="uppercase" size="xs" pl="md" fw={500} mb="sm" className={classes.linkHeader}>
          {m.title}
        </Text>
        {m.links.map((item) => {
          const initiallyOpened = item.links?.some((link) => link.link === pathname); // set initially opened if any of sublinks matches current pathname
          return (
            <LinksGroup
              {...item}
              key={item.label}
              initiallyOpened={initiallyOpened}
              matchMobile={match_width_mobile}
              closeNav={onClose}
            />
          );
        })}
      </Box>
    ));
    setLinks(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Flex justify="space-between" align="center" gap="sm">
          <Group justify="space-between" style={{ flex: match_width_mobile ? "auto" : 1 }}>
            <Logo />
          </Group>
          {match_width_mobile && (
            <ActionIcon onClick={onClose} variant="transparent">
              <IconX />
            </ActionIcon>
          )}
        </Flex>
      </div>

      <ScrollArea className={classes.links} pos={"relative"}>
        <div className={classes.linksInner}>
          {links.length > 0 ? links : <Loader size={75} type="ring" ms={"auto"} me={"auto"} />}
        </div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserProfileButton name={profile?.name} username={user.username} />
      </div>
    </nav>
  );
};

export default Navigation;
