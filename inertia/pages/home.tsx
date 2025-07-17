import { SharedProps } from '@adonisjs/inertia/types'
import { Stack } from '@mantine/core'

import Logo from '@/components/homepage/logo'
import PublicLayout from '@/layouts/public'

export default function Home(props: SharedProps) {
  return (
    <PublicLayout {...props}>
      <div className="max-w-3xl mx-auto pt-5">
        <Logo />
        <Stack>
          <h1 className="text-4xl font-extrabold text-center">Dadangdut33</h1>
          <p className="text-xl text-neutral-500 dark:text-white/80 text-center">
            Code, Create, Contribute—One Commit at a Time.
          </p>
        </Stack>
      </div>
    </PublicLayout>
  )
}
