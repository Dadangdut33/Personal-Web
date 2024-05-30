"use client";

import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";
import { Link } from "@/components/Router";
import { Burger, Container, Group, Paper, Title, Transition } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { usePathname } from "next/navigation";

import classes from "./Header.module.css";

const links = [
  { link: "/", label: "About" },
  { link: "/projects", label: "Projects" },
  { link: "/blog", label: "Blog" },
];

export function HeaderMenu() {
  const [opened, { toggle }] = useDisclosure(false);
  const pathname = usePathname();

  const items = links.map((link) => (
    <span className="subtle-link" key={link.label}>
      <Link href={link.link} className={classes.link + (pathname === link.link ? ` ${classes.active}` : "")}>
        {link.label}
      </Link>
    </span>
  ));

  return (
    <header className={classes.header}>
      <Container size="md" className={classes.inner}>
        <span className="subtle-link">
          <Link href={"/"}>
            <Title c={"#2978b5"} order={4} fw={900}>
              Dadangdut33
            </Title>
          </Link>
        </span>

        <Group gap={5} visibleFrom="sm">
          {items}
          <ColorSchemeToggle />
        </Group>

        <Group gap={4} hiddenFrom="sm">
          <ColorSchemeToggle />
          <Burger opened={opened} onClick={toggle} size="sm" />
        </Group>
      </Container>

      <Transition transition="scale-y" duration={200} mounted={opened}>
        {(styles) => (
          <Paper className={classes.dropdown} withBorder style={styles} hiddenFrom="sm">
            {items}
          </Paper>
        )}
      </Transition>
    </header>
  );
}