import { ActionIcon, Container, Group, Text, Tooltip } from "@mantine/core";
import { IconBrandGithub, IconBrandLinkedin, IconCoffee, IconDeviceAnalytics, IconMail } from "@tabler/icons-react";
import Link from "next/link";

import { analyticsLink } from "../../lib";
import classes from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={"footer"}>
      <Container className={classes.inner}>
        <Group gap={8} className={classes.links}>
          <Tooltip
            label="See my profile at Linkedin"
            position="top"
            color={"blue"}
            transitionProps={{ transition: "skew-down" }}
            withArrow
          >
            <span className="subtle-link">
              <ActionIcon
                href={"https://www.linkedin.com/in/fauzan-farhan-antoro/"}
                variant="subtle"
                size="lg"
                component={Link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandLinkedin stroke={1.5} />
              </ActionIcon>
            </span>
          </Tooltip>
          <Tooltip
            label="Follow me on Github"
            position="top"
            color={"blue"}
            transitionProps={{ transition: "skew-down" }}
            withArrow
          >
            <span className="subtle-link">
              <ActionIcon
                variant="subtle"
                size="lg"
                href={"https://github.com/Dadangdut33/"}
                component={Link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandGithub stroke={1.5} />
              </ActionIcon>
            </span>
          </Tooltip>
          <Tooltip
            label="Contact me via email"
            position="top"
            color={"blue"}
            transitionProps={{ transition: "skew-down" }}
            withArrow
          >
            <span className="subtle-link">
              <ActionIcon variant="subtle" size="lg" href={`mailto:dadang.contact@gmail.com`} component={Link}>
                <IconMail stroke={1.5} />
              </ActionIcon>
            </span>
          </Tooltip>
          <Tooltip
            label="Buy me a coffee"
            position="top"
            color={"blue"}
            transitionProps={{ transition: "skew-down" }}
            withArrow
          >
            <span className="subtle-link">
              <ActionIcon
                variant="subtle"
                size="lg"
                component={Link}
                href={"https://ko-fi.com/dadangdut33"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconCoffee stroke={1.5} />
              </ActionIcon>
            </span>
          </Tooltip>
          <Tooltip
            label="See web analytics"
            position="top"
            color={"blue"}
            transitionProps={{ transition: "skew-down" }}
            withArrow
          >
            <span className="subtle-link">
              <ActionIcon
                variant="subtle"
                size="lg"
                href={analyticsLink}
                component={Link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconDeviceAnalytics stroke={1.5} />
              </ActionIcon>
            </span>
          </Tooltip>
        </Group>
        <Tooltip label="Made with ❤️ by Dadangdut33" color={"blue"} transitionProps={{ transition: "pop" }} withArrow>
          <span style={{ marginTop: "1rem" }}>
            <Text
              href={"https://github.com/Dadangdut33/Personal-Web"}
              component={Link}
              c={"#2978b5"}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              fw={600}
              size="16 px"
            >
              © 2022 Dadangdut33
            </Text>
          </span>
        </Tooltip>
      </Container>
    </footer>
  );
}
