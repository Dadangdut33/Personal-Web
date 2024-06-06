"use client";

import { Container, Group, Text, Tooltip } from "@mantine/core";
import { IconBrandGithub, IconBrandLinkedin, IconCoffee, IconDeviceAnalytics, IconMail } from "@tabler/icons-react";
import Link from "next/link";

import classes from "./Footer.module.css";
import Button from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="mt-auto">
      <Container className={classes.inner}>
        <Group gap={8} className={classes.links}>
          <Tooltip
            label="See my profile at Linkedin"
            position="top"
            transitionProps={{ transition: "skew-down" }}
            withArrow
          >
            <span>
              <Button
                href={"https://www.linkedin.com/in/fauzan-farhan-antoro/"}
                size="icon"
                component={Link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandLinkedin stroke={1.5} />
              </Button>
            </span>
          </Tooltip>
          <Tooltip label="Follow me on Github" position="top" transitionProps={{ transition: "skew-down" }} withArrow>
            <span>
              <Button
                size="icon"
                href={"https://github.com/Dadangdut33/"}
                component={Link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandGithub stroke={1.5} />
              </Button>
            </span>
          </Tooltip>
          <Tooltip label="Contact me via email" position="top" transitionProps={{ transition: "skew-down" }} withArrow>
            <span>
              <Button size="icon" href={`mailto:dadang.contact@gmail.com`} component={Link}>
                <IconMail stroke={1.5} />
              </Button>
            </span>
          </Tooltip>
          <Tooltip label="Buy me a coffee" position="top" transitionProps={{ transition: "skew-down" }} withArrow>
            <span>
              <Button
                size="icon"
                component={Link}
                href={"https://ko-fi.com/dadangdut33"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconCoffee stroke={1.5} />
              </Button>
            </span>
          </Tooltip>
          <Tooltip label="View web analytics" position="top" transitionProps={{ transition: "skew-down" }} withArrow>
            <span>
              <Button
                size="icon"
                href={`https://umami-dadangdut33.vercel.app/share/CeNrooIIHD2wzJVe/dadangdut33.vercel.app`}
                component={Link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconDeviceAnalytics stroke={1.5} />
              </Button>
            </span>
          </Tooltip>
        </Group>
        <Tooltip label="Made with ❤️ by Dadangdut33" transitionProps={{ transition: "pop" }} withArrow>
          <span style={{ marginTop: "1rem" }}>
            <Text
              href={"https://github.com/Dadangdut33/Personal-Web"}
              component={Link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: "none" }}
              size="16 px"
            >
              © 2024 Dadangdut33
            </Text>
          </span>
        </Tooltip>
      </Container>
    </footer>
  );
}
