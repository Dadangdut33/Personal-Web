'use client';

import { useRedirectMsg } from '@/lib/hooks';
import { AuthSessionUser } from '@/lib/types';
import { AppShell, Box, Container, rem, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { ReactNode, useState } from 'react';

import Navigation from './Navigation';
import TopNav from './TopNav';
import classes from './Wrapper.module.css';

type Props = {
  children: ReactNode;
  user: AuthSessionUser;
};

function LayoutDashboard({ children, user }: Props) {
  const theme = useMantineTheme();
  const tablet_match = useMediaQuery('(max-width: 768px)');
  const [opened, setOpened] = useState(false);
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  useRedirectMsg(true, 'Redirect Message');

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'md',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding={0}
    >
      <AppShell.Header
        style={{
          height: rem(66),
          boxShadow: tablet_match ? theme.shadows.md : theme.shadows.lg,
        }}
        className={classes.menu + ' border-b-4 border-black'}
      >
        <Container fluid py="sm" px="lg">
          <TopNav
            opened={opened}
            handleOpen={() => setOpened((o) => !o)}
            desktopOpened={desktopOpened}
            mobileOpened={mobileOpened}
            toggleDesktop={toggleDesktop}
            toggleMobile={toggleMobile}
          />
        </Container>
      </AppShell.Header>
      <AppShell.Navbar className={classes.menu}>
        <Navigation onClose={closeMobile} user={user} />
      </AppShell.Navbar>
      <AppShell.Main className={classes.main}>
        <Box py="lg" px="md" pos={'relative'} mih={'90vh'}>
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}

export default LayoutDashboard;
