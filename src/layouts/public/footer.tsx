'use client'

import { Link } from '@inertiajs/react'
import { Container, Group, Text, Tooltip } from '@mantine/core'
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconCoffee,
  IconDeviceAnalytics,
  IconMail,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import classes from './footer.module.css'

export default function Footer() {
  return (
    <footer className="mt-auto">
      <Container className={classes.inner}>
        <Group gap={8} className={classes.links}>
          <Tooltip
            label="See my profile at Linkedin"
            position="top"
            transitionProps={{ transition: 'skew-down' }}
            withArrow
          >
            <Link
              href={'https://www.linkedin.com/in/fauzan-farhan-antoro/'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="icon">
                <IconBrandLinkedin stroke={1.5} />
              </Button>
            </Link>
          </Tooltip>
          <Tooltip
            label="Follow me on Github"
            position="top"
            transitionProps={{ transition: 'skew-down' }}
            withArrow
          >
            <Link
              href={'https://github.com/Dadangdut33/'}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="icon">
                <IconBrandGithub stroke={1.5} />
              </Button>
            </Link>
          </Tooltip>
          <Tooltip
            label="Contact me via email"
            position="top"
            transitionProps={{ transition: 'skew-down' }}
            withArrow
          >
            <Link href={`mailto:dadang.contact@gmail.com`}>
              <Button size="icon">
                <IconMail stroke={1.5} />
              </Button>
            </Link>
          </Tooltip>
          <Tooltip
            label="Buy me a coffee"
            position="top"
            transitionProps={{ transition: 'skew-down' }}
            withArrow
          >
            <Link href={'https://ko-fi.com/dadangdut33'} target="_blank" rel="noopener noreferrer">
              <Button size="icon">
                <IconCoffee stroke={1.5} />
              </Button>
            </Link>
          </Tooltip>
          <Tooltip
            label="View web analytics"
            position="top"
            transitionProps={{ transition: 'skew-down' }}
            withArrow
          >
            <Link
              href={`https://umami-dadangdut33.vercel.app/share/CeNrooIIHD2wzJVe/dadangdut33.vercel.app`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="icon">
                <IconDeviceAnalytics stroke={1.5} />
              </Button>
            </Link>
          </Tooltip>
        </Group>
        <Tooltip
          label="Made with ❤️ by Dadangdut33"
          transitionProps={{ transition: 'pop' }}
          withArrow
        >
          <span style={{ marginTop: '1rem' }}>
            <Text
              href={'https://github.com/Dadangdut33/Personal-Web'}
              component={Link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
              size="16 px"
              fw={600}
            >
              © {new Date().getFullYear()} Dadangdut33
            </Text>
          </span>
        </Tooltip>
      </Container>
    </footer>
  )
}
