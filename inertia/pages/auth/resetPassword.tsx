import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import type AuthController from '@app/controllers/auth.controller.ts'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Box, Loader, Popover, Progress, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { Turnstile } from '@marsidev/react-turnstile'
import { IconArrowLeft } from '@tabler/icons-react'
import { useState } from 'react'
import PasswordRequirement, { getPasswordStrength } from '~/components/auth/password'
import { ConfirmModal } from '~/components/core/modals'
import { NotifyError } from '~/components/core/notify'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import AuthLayout from '~/layouts/auth'
import { PASS_REGEX, PASS_REQ } from '~/lib/constants'
import { checkForm, cn } from '~/lib/utils'

export default function Page(
  props: SharedProps & InferPageProps<AuthController, 'viewResetPassword'>
) {
  const [popoverOpened, setPopoverOpened] = useState(false)
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      password_confirmation: '',
      token: props.token,
      cf_token: '',
    },
    validate: {
      email: (value) => (value.length > 0 ? null : 'Email is required'),
      password: (value) => (PASS_REGEX.test(value) ? null : 'Password does not meet requirements'),
      password_confirmation: (value) => {
        if (!PASS_REGEX.test(value)) return 'Password does not meet requirements'
        if (value !== form.values.password) return 'Passwords do not match'
        return null
      },
      token: (value) => (value.length > 0 ? null : 'Token is required'),
      cf_token: (value) => (value.length > 0 ? null : 'Captcha is required'),
    },
  })
  const mutation = useGenericMutation('POST', route('auth.resetPassword.post').path, {
    onError(error, _variables, _context) {
      if (error.response?.data.form_errors) {
        form.setErrors(error.response?.data.form_errors)
      }
    },
  })
  const doMutate = () => {
    if (!checkForm(form, { bypass_captcha: props.bypass_captcha })) return
    mutation.mutate(form.values)
  }

  const checks = PASS_REQ.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(form.values.password)}
    />
  ))
  const strength = getPasswordStrength(form.values.password)
  const color = strength === 100 ? 'teal' : strength > 50 ? 'yellow' : 'red'

  const confirm = ConfirmModal({
    message: 'Are you sure you want to reset your password?',
    onConfirm: () => {
      doMutate()
    },
  })

  return (
    <AuthLayout>
      <Head>
        <title>Reset Password</title>
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

      <div className={cn('flex flex-col gap-4')}>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset Password</CardTitle>
            <CardDescription>Fill the form to Reset Password</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
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

              <Popover
                opened={popoverOpened}
                position="bottom"
                width="target"
                transitionProps={{ transition: 'pop' }}
              >
                <Popover.Target>
                  <div
                    onFocusCapture={() => setPopoverOpened(true)}
                    onBlurCapture={() => setPopoverOpened(false)}
                    className="space-y-4"
                  >
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
                  </div>
                </Popover.Target>
                <Popover.Dropdown className="bg-background">
                  <Progress color={color} value={strength} size={5} mb="xs" />
                  <PasswordRequirement
                    label="Must be at least 8 characters"
                    meets={form.values.password.length >= 8}
                  />
                  {checks}
                </Popover.Dropdown>
              </Popover>

              {props.site_key && !props.bypass_captcha && (
                <>
                  <Turnstile
                    className="mx-auto"
                    siteKey={props.site_key}
                    onSuccess={(cf_token) => form.setFieldValue('cf_token', cf_token)}
                    onExpire={() => {
                      form.setFieldValue('cf_token', '')
                    }}
                    onError={() => NotifyError('Error', 'Failed to load captcha')}
                  />
                  <Text size="xs" mt="xs" color="red" className="text-center">
                    {form.errors.cf_token}
                  </Text>
                </>
              )}

              <Button className="w-full" disabled={mutation.isPending} onClick={confirm}>
                {mutation.isPending && <Loader size={16} color="black" />}
                Reset Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
