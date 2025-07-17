import { SharedProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/core'
import { Head, Link, useForm } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Box, Image, Loader } from '@mantine/core'
import { Turnstile } from '@marsidev/react-turnstile'
import { IconArrowLeft } from '@tabler/icons-react'

import { NotifyError } from '@/components/core/notify'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AuthLayout from '@/layouts/auth'
import { cn } from '@/lib/utils'

import { AuthProps } from './props'

export default function Page(props: SharedProps & AuthProps) {
  const form = useForm({
    email: '',
    password: '',
    cf_token: '',
  })

  const onSubmit = async () => {
    form.post(route('auth.login.post').path, {
      onError: () => NotifyError('Error', 'Failed to login'),
    })
  }

  return (
    <AuthLayout>
      <Head>
        <title>Login</title>
      </Head>
      <Box pos={'absolute'} top={10} left={10}>
        <Button
          disabled={form.processing}
          onClick={() => {
            router.visit('/')
          }}
        >
          {form.processing ? <Loader size={16} color="black" /> : <IconArrowLeft stroke={2} />}
          Home
        </Button>
      </Box>

      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <Image src={'/assets/logo-transparent.png'} alt="Logo" w={150} />
        </Link>
      </div>

      <div className={cn('flex flex-col gap-6')}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome</CardTitle>
            <CardDescription>Fill the form to login</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <Input
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  required
                  value={form.data.email}
                  error={form.errors.email}
                  onChange={(e) => form.setData('email', e.target.value)}
                />
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password*</Label>
                    <Link
                      href={route('auth.resetPassword', { params: { token: '' } }).path}
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="******"
                    required
                    value={form.data.password}
                    error={form.errors.password}
                    onChange={(e) => form.setData('password', e.target.value)}
                  />
                </div>

                {props.site_key && !props.bypass_captcha && (
                  <Turnstile
                    className="mx-auto"
                    siteKey={props.site_key}
                    onSuccess={(cf_token) => form.setData('cf_token', cf_token)}
                    onExpire={() => {
                      form.setData('cf_token', '')
                    }}
                    onError={() => NotifyError('Error', 'Failed to load captcha')}
                  />
                )}
                <Button className="w-full" disabled={form.processing}>
                  {form.processing && <Loader size={16} color="black" />}
                  Login
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href={route('auth.register').path} className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
