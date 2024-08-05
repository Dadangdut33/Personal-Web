'use client';

import { BtnSignOutIcon } from '@/components/Button/BtnSignOut';
import { BtnToggleColor } from '@/components/Button/BtnToggleColor';
import { Link, useRouter } from '@/components/Router';
import Button from '@/components/ui/Button';
import { Box, Burger, Group } from '@mantine/core';
import { IconHome, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';

type TopNavProps = {
  opened?: boolean;
  handleOpen?: () => void;
  mobileOpened?: boolean;
  toggleMobile?: () => void;
  desktopOpened?: boolean;
  toggleDesktop?: () => void;
};

const TopNav = ({ handleOpen, opened, desktopOpened, toggleDesktop, toggleMobile, mobileOpened }: TopNavProps) => {
  const router = useRouter();

  return (
    <Group justify="space-between">
      <Group gap={0}>
        <Box component="span" visibleFrom="md">
          <Button onClick={toggleDesktop} size={'sm'}>
            {desktopOpened ? <IconLayoutSidebarLeftCollapse /> : <IconLayoutSidebarLeftExpand />}
          </Button>
        </Box>
        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="md" size="sm" />
      </Group>
      <Group gap={'xs'}>
        <BtnToggleColor size="sm" />
        <Button component={Link} href="/" size="sm">
          <IconHome />
        </Button>
        <BtnSignOutIcon />
      </Group>
    </Group>
  );
};

export default TopNav;
