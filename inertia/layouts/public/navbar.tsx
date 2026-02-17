'use client'

import { Link, usePage } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { AnimatePresence, motion } from 'framer-motion'
import { Code2Icon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ThemeSwitcher } from '~/components/core/theme-switcher'
import { NAVIGATION_LINKS } from '~/lib/constants'
import { cn } from '~/lib/utils'

import Search from './search'

const MotionLink = motion.create(Link)

export default function Navbar() {
  const { url, props } = usePage()
  const [isHome, setIsHome] = useState(props.previousPath === route('home').path)

  useEffect(() => {
    setIsHome(url === route('home').path)
  }, [url])

  return (
    <nav className="fixed left-0 top-0 z-20 w-full border-b-4 border-border bg-secondary-background px-5">
      <div className="mx-auto flex h-[70px] w-[1300px] max-w-full items-center justify-between text-foreground font-geistmono">
        <div className="flex items-center gap-10">
          <MotionLink
            href={route('home').path}
            initial={isHome ? true : false}
            animate={{ width: isHome ? '9.2rem' : '2rem' }}
            whileHover={
              !isHome
                ? {
                    x: '4px',
                    y: '4px',
                    boxShadow: 'none',
                  }
                : {}
            }
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (isHome) e.preventDefault() // don’t remount if already home
            }}
            className={cn(
              'px-1 flex items-center justify-center overflow-hidden rounded-base border-2 border-black bg-main text-main-foreground',
              !isHome ? 'shadow-nav dark:shadow-navDark' : ''
            )}
          >
            <Code2Icon className="h-8 w-8" />

            <AnimatePresence mode="wait">
              <motion.span
                key={isHome ? 'visible' : 'hidden'}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={cn('text-[16px]', isHome ? 'pl-1' : '')}
              >
                {isHome && 'Dadangdut33'}
              </motion.span>
            </AnimatePresence>
          </MotionLink>

          <div className="hidden items-center gap-5 text-base font-base sm:flex xl:gap-7">
            {NAVIGATION_LINKS.map(({ text, href }) => (
              <Link key={href} href={href} className="link-underline" data-active={url === href}>
                {text}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Search />
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  )
}
