import { Link } from '@adonisjs/inertia/react'
import { Stack } from '@mantine/core'
import { ArrowRight } from 'lucide-react'
import Logo from '~/components/homepage/logo'
import BlogCard from '~/components/page-components/blog/blog-card'
import PublicPageShell from '~/components/page-components/public/public-page-shell'
import { Button } from '~/components/ui/button'
import PublicLayout from '~/layouts/public'
import { urlFor } from '~/lib/client'
import { InertiaProps } from '~/types'
import type { Data } from '~data'

type PageProps = InertiaProps<{ latestBlogs: Data.Blog[] }>

export default function Home(props: PageProps) {
  return (
    <PublicLayout>
      <PublicPageShell className="pb-0">
        <Logo />
        <Stack>
          <h1 className="text-4xl font-extrabold text-center font-geist">Dadangdut33</h1>
          <p className="text-xl text-neutral-500 dark:text-white/80 text-center">
            Code, Create, Contribute—One Commit at a Time.
          </p>
        </Stack>

        {props.latestBlogs?.length > 0 && (
          <section className="mt-10 space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-heading">Latest Blog Posts</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {props.latestBlogs?.map((blog) => (
                <BlogCard key={blog.id} blog={blog} variant="compact" />
              ))}
            </div>

            <div className="flex justify-center">
              <Button asChild size="sm" variant="neutral">
                <Link href={urlFor('blog')}>
                  View all posts
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </section>
        )}
      </PublicPageShell>
    </PublicLayout>
  )
}
