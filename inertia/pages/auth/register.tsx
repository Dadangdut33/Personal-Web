import { SharedProps } from '@adonisjs/inertia/types'
import { Head } from '@inertiajs/react'

export default function Page(props: SharedProps) {
  return (
    <>
      <Head>
        <title>Login</title>
      </Head>
      Test page
    </>
  )
}
