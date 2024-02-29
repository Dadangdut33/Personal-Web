"use client";

import { ActionIcon, Group, useMantineColorScheme } from "@mantine/core";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";

export function ColorSchemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group>
      <ActionIcon
        onClick={toggleColorScheme}
        size="xl"
        style={{
          color: colorScheme === "dark" ? "--var(--mantine-colors-yellow-4)" : "--var(--mantine-colors-blue-6)",
        }}
        variant="subtle"
      >
        {colorScheme === "dark" ? <SunIcon width={20} height={20} /> : <MoonIcon width={20} height={20} />}
      </ActionIcon>
    </Group>
  );
}
