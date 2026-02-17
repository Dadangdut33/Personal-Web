import { SharedProps } from '@adonisjs/inertia/types'
import { Link, usePage } from '@inertiajs/react'
import FlashAlert from '~/components/core/flash'
import Logo from '~/components/homepage/logo'

const CustomLogoWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="max-h-[220px] max-w-[300px] overflow-hidden">{children}</div>
}

export default function AuthLayout({
  children,
  alertClassName,
}: {
  children: React.ReactNode
  alertClassName?: string
}) {
  const { props } = usePage<SharedProps>()

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 md:p-10"
      id="main"
    >
      <div className="w-full max-w-2xl">
        <div className="flex w-full max-w-2xl flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <Logo CustomWrapper={CustomLogoWrapper} imgClassname="w-[180px]" />
          </Link>
        </div>
        <FlashAlert state={props.flashMessages ?? {}} className={alertClassName} />
        {children}
      </div>
    </div>
  )
}
