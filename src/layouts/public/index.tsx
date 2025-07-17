import { SharedProps } from '@adonisjs/inertia/types'

import Analytics from '@/components/core/analytics'

import Footer from './footer'
import Navbar from './navbar'

export default function PublicLayout(props: SharedProps & { children: React.ReactNode }) {
  return (
    <>
      <Analytics id={props.umami_id!} url={props.umami_public_url!} />
      <div className="flex flex-col min-h-screen w-full" id="main">
        <Navbar />
        <div className="pt-[85px] mb-8" id="content">
          {props.children}
        </div>
        <Footer />
      </div>
    </>
  )
}
