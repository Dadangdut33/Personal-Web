'use client';

import Button, { ButtonProps } from '@/components/ui/Button';
import { useMantineColorScheme } from '@mantine/core';
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

export function BtnToggleColor({
  parameters,
  size = 'icon',
}: {
  parameters?: Omit<ButtonProps, 'size'>;
  size?: ButtonProps['size'];
}) {
  const { toggleColorScheme } = useMantineColorScheme();
  return (
    <Button onClick={toggleColorScheme} {...parameters} size={size}>
      <BaseBtnToggleColor />
    </Button>
  );
}

export function BaseBtnToggleColor() {
  return (
    <>
      <SunIcon className="h-6 w-6 m500:h-4 m500:w-4 hidden dark:block" width={20} height={20} />
      <MoonIcon className="h-6 w-6 m500:h-4 m500:w-4 dark:hidden" width={20} height={20} />
    </>
  );
}
