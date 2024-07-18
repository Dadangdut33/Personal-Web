"use client";

import { BtnSignOutIcon } from "@/components/Button/BtnSignOut";
import { ActionIcon, Burger, Group, Tooltip } from "@mantine/core";
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from "@tabler/icons-react";

type TopNavProps = {
  opened?: boolean;
  handleOpen?: () => void;
  mobileOpened?: boolean;
  toggleMobile?: () => void;
  desktopOpened?: boolean;
  toggleDesktop?: () => void;
};

const TopNav = ({ handleOpen, opened, desktopOpened, toggleDesktop, toggleMobile, mobileOpened }: TopNavProps) => {
  return (
    <Group justify="space-between">
      <Group gap={0}>
        <Tooltip events={{ hover: true, focus: true, touch: true }} label="Toggle navigation menu">
          <ActionIcon visibleFrom="md" onClick={toggleDesktop} size={"lg"}>
            {desktopOpened ? <IconLayoutSidebarLeftCollapse /> : <IconLayoutSidebarLeftExpand />}
          </ActionIcon>
        </Tooltip>
        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="md" size="sm" />
      </Group>
      <Group>
        <BtnSignOutIcon />
      </Group>
    </Group>
  );
};

export default TopNav;
