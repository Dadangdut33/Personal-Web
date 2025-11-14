'use client'

import { useMantineColorScheme } from '@mantine/core'
import { Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '~/components/ui/button'

export function ThemeSwitcher() {
  const { toggleColorScheme, colorScheme } = useMantineColorScheme()

  // sync to html class
  useEffect(() => {
    document.body.classList.toggle('dark', colorScheme === 'dark')
  }, [colorScheme])

  return (
    <>
      <Button
        className="size-9 p-0 [&_svg]:size-5 shadow-nav hover:translate-x-[4px]! hover:translate-y-[4px]! hover:shadow-none bg-secondary-background"
        onClick={toggleColorScheme}
      >
        <Sun className="hidden dark:inline stroke-foreground" />
        <Moon className="inline dark:hidden stroke-foreground" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </>
  )
}
