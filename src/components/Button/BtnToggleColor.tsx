"use client";

import { useMantineColorScheme } from "@mantine/core";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import Button from "@/components/ui/Button";

export function BtnToggleColor() {
  const { toggleColorScheme } = useMantineColorScheme();
  return (
    <Button onClick={toggleColorScheme} className="btn-size-icon">
      <SunIcon className="h-6 w-6 m500:h-4 m500:w-4 text-yellow-300 hidden dark:block" width={20} height={20} />
      <MoonIcon className="h-6 w-6 m500:h-4 m500:w-4 text-blue-400 dark:hidden" width={20} height={20} />
    </Button>
  );
}
