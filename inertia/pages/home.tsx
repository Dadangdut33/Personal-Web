import HomeController from '#controllers/home.controller'

import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import { Link } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Stack } from '@mantine/core'
import { ArrowRight } from 'lucide-react'
import Logo from '~/components/homepage/logo'
import BlogCard from '~/components/page-components/blog/blog-card'
import { Button } from '~/components/ui/button'
import PublicLayout from '~/layouts/public'

type PageProps = SharedProps & InferPageProps<HomeController, 'view'>

export default function Home(props: PageProps) {
  return (
    <PublicLayout>
      <div className="mx-auto w-[1300px] max-w-full px-5 pt-5">
        <Logo />
        <Stack>
          <h1 className="text-4xl font-extrabold text-center">Dadangdut33</h1>
          <p className="text-xl text-neutral-500 dark:text-white/80 text-center">
            Code, Create, Contribute—One Commit at a Time.
          </p>
        </Stack>

        <section className="mt-10 space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-heading">Latest Blog Posts</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {props.latestBlogs?.map((blog) => <BlogCard key={blog.id} blog={blog} variant="compact" />)}
          </div>

          <div className="flex justify-center">
            <Button asChild size="sm" variant="neutral">
              <Link href={route('blog').path}>
                View all posts
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </PublicLayout>
  )
}
