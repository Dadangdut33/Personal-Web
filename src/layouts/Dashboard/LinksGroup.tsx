import { Box, Collapse, Group, Text, UnstyledButton } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { last as getLastItem } from "lodash";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import classes from "./LinksGroup.module.css";

interface LinksGroupProps {
  icon?: any;
  label: string;
  initiallyOpened?: boolean;
  link?: string;
  links?: {
    label: string;
    link: string;
    icon?: any;
  }[];
  matchMobile?: boolean;
  closeNav?: () => void;
}

export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  link,
  links,
  matchMobile,
  closeNav,
}: LinksGroupProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);
  const [currentPath, setCurrentPath] = useState<string | undefined>();
  const ChevronIcon = IconChevronRight;

  const items = (hasLinks ? links : []).map((link, i) => {
    return (
      <Box
        variant="transparent"
        key={i}
        component={Link}
        className={classes.link}
        href={link.link}
        data-active={link.link.toLowerCase() === pathname || undefined}
        onClick={() => {
          if (matchMobile && closeNav) closeNav();
        }}
      >
        <Group gap={4}>
          {link.icon && <link.icon size={14} />}
          <Text className={classes.linkText}>{link.label}</Text>
        </Group>
      </Box>
    );
  });

  useEffect(() => {
    const paths = pathname.split("/");
    // check first if not initially opened and its not the link then closeq
    if (!initiallyOpened && pathname !== link) setOpened(false);
    // if it turns out to be the link, open it
    if (pathname === link) setOpened(true);

    setCurrentPath(getLastItem(paths)?.toLowerCase() || undefined);
  }, [pathname, link, initiallyOpened]);

  const btnProps = hasLinks
    ? {
        onClick: () => {
          if (hasLinks) setOpened((o) => !o);
          // if a link is provided, navigate to it
          if (link) {
            router.push(link || "#");

            if (matchMobile && closeNav) closeNav();
          }
        },
      }
    : {
        component: Link,
        href: link || "#",
        onClick: () => {
          if (matchMobile && closeNav) closeNav();
        },
      };

  return (
    <>
      {/* @ts-ignore */}
      <UnstyledButton {...btnProps} className={classes.control} data-active={opened || undefined}>
        <Group justify="space-between" gap={0}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <Icon size={18} />
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <ChevronIcon
              className={classes.chevron}
              size="1rem"
              stroke={1.5}
              style={{
                transform: opened ? `rotate(90deg)` : "none",
              }}
            />
          )}
        </Group>
      </UnstyledButton>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
