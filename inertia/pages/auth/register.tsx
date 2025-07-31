import { SharedProps } from '@adonisjs/inertia/types'
import { router } from '@inertiajs/core'
import { Head, Link } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Box, Image, Loader } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Turnstile } from '@marsidev/react-turnstile'
import { IconArrowLeft } from '@tabler/icons-react'

import { NotifyError } from '@/components/core/notify'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useGenericMutation } from '@/hooks/use_generic_mutation'
import AuthLayout from '@/layouts/auth'
import { cn } from '@/lib/utils'

import { AuthProps } from './props'

export default function Page(props: SharedProps & AuthProps) {
  const form = useForm({
    initialValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
      cf_token: '',
    },
    validate: {
      fullName: (value) => (value.length > 0 ? null : 'FullName is required'),
      username: (value) => (value.length > 0 ? null : 'Username is required'),
      email: (value) => (value.length > 0 ? null : 'Email is required'),
      password: (value) => (value.length > 0 ? null : 'Password is required'),
      password_confirmation: (value) => {
        if (value !== form.values.password) return 'Passwords do not match'
        if (value.length < 8) return 'Password is required'
        return null
      },
    },
  })
  const mutation = useGenericMutation('POST', route('auth.register.post').path, {
    onError(error, _variables, _context) {
      if (error.response?.data.form_errors) {
        form.setErrors(error.response?.data.form_errors as any)
      }
    },
  })
  const doMutate = () => {
    const { hasErrors, errors } = form.validate()
    console.log(hasErrors, errors)
    if (hasErrors) return
    mutation.mutate(form.values)
  }

  return (
    <AuthLayout>
      <Head>
        <title>Register</title>
      </Head>
      <Box pos={'absolute'} top={10} left={10}>
        <Button
          disabled={mutation.isPending}
          onClick={() => {
            router.visit(route('auth.login').path)
          }}
        >
          {mutation.isPending ? <Loader size={16} color="black" /> : <IconArrowLeft stroke={2} />}
          Back to Login
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
            <CardTitle className="text-xl">Register</CardTitle>
            <CardDescription>Fill the form to register an account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <Input
                  label="Full Name"
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  required
                  value={form.values.fullName}
                  error={form.errors.fullName}
                  onChange={(e) => form.setFieldValue('fullName', e.target.value)}
                />

                <Input
                  label="Username"
                  id="username"
                  type="text"
                  placeholder="johnsmith67"
                  required
                  value={form.values.username}
                  error={form.errors.username}
                  onChange={(e) => form.setFieldValue('username', e.target.value)}
                />

                <Input
                  label="Email"
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  required
                  value={form.values.email}
                  error={form.errors.email}
                  onChange={(e) => form.setFieldValue('email', e.target.value)}
                />

                <Input
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="******"
                  required
                  value={form.values.password}
                  error={form.errors.password}
                  onChange={(e) => form.setFieldValue('password', e.target.value)}
                />

                <Input
                  label="Password Confirmation"
                  id="password_confirmation"
                  type="password"
                  placeholder="******"
                  required
                  value={form.values.password_confirmation}
                  error={form.errors.password_confirmation}
                  onChange={(e) => form.setFieldValue('password_confirmation', e.target.value)}
                />

                {props.site_key && !props.bypass_captcha && (
                  <Turnstile
                    className="mx-auto"
                    siteKey={props.site_key}
                    onSuccess={(cf_token) => form.setFieldValue('cf_token', cf_token)}
                    onExpire={() => {
                      form.setFieldValue('cf_token', '')
                    }}
                    onError={() => NotifyError('Error', 'Failed to load captcha')}
                  />
                )}

                <Button className="w-full" disabled={mutation.isPending} onClick={() => doMutate()}>
                  {mutation.isPending && <Loader size={16} color="black" />}
                  Register
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
