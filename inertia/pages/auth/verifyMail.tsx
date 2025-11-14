import { InferPageProps, SharedProps } from '@adonisjs/inertia/types'
import type AuthController from '@app/controllers/auth.controller.ts'
import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { route } from '@izzyjs/route/client'
import { Alert, Box, Group, Loader, Text } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useInterval, useLocalStorage, useTimeout } from '@mantine/hooks'
import { Turnstile } from '@marsidev/react-turnstile'
import { IconArrowLeft, IconMessageCircle, IconTimeDuration30 } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { ConfirmLogoutModal, ConfirmModal } from '~/components/core/modals'
import { NotifyError } from '~/components/core/notify'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  cardClass,
} from '~/components/ui/card'
import { useGenericMutation } from '~/hooks/use_generic_mutation'
import AuthLayout from '~/layouts/auth'
import { TIMEOUT_SHORT } from '~/lib/constants'
import { checkForm, cn } from '~/lib/utils'

export default function Page(
  props: SharedProps & InferPageProps<AuthController, 'viewResetPassword'>
) {
  const [timedOut, setTimedOut] = useLocalStorage({
    key: 'timeout_verify_email',
    defaultValue: false,
  })
  const [timedOutStart, setTimedOutStart] = useLocalStorage<null | number>({
    key: 'timeout_verify_email_start',
    defaultValue: null,
  })
  const [timedOutIsNew, setTimedOutIsNew] = useLocalStorage({
    key: 'timeout_verify_email_new',
    defaultValue: true,
  })
  const { start } = useTimeout(() => setTimedOut(false), TIMEOUT_SHORT) // after send, timeout for 3 minute
  const [timerSec, setTimerSec] = useState(TIMEOUT_SHORT)
  const interval = useInterval(() => {
    if (timerSec <= 0) {
      setTimerSec(TIMEOUT_SHORT)
      interval.stop()
    } else {
      setTimerSec((s) => s - 1000)
    }
  }, 1000)

  const startTimeoutAndTimer = () => {
    setTimedOutIsNew(true)
    interval.start()
    setTimedOut(true)
    setTimedOutStart(Date.now())
    start()
  }

  const form = useForm({
    initialValues: {
      email: '',
      cf_token: '',
    },

    validate: {
      email: (value) => (value.length > 0 ? null : 'Email is required'),
      cf_token: (value) => (value.length > 0 ? null : 'Captcha is required'),
    },
  })
  const mutation = useGenericMutation('POST', route('auth.verifyMail.post').path, {
    onError(error, _variables, _context) {
      if (error.response?.data.form_errors) {
        form.setErrors(error.response?.data.form_errors)
      }
      setTimedOutIsNew(false)
    },
    onSuccess() {
      startTimeoutAndTimer()
      form.reset()
    },
  })
  const doMutate = () => {
    if (!checkForm(form, { bypass_captcha: props.bypass_captcha })) return
    if (timedOut)
      return NotifyError('Error', 'Please wait until you can request another password reset email.')

    mutation.mutate(form.values)
  }

  // if just came from register
  useEffect(() => {
    // start timeout immediately
    if (timedOutIsNew) {
      startTimeoutAndTimer()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // init timeout
  // if timeout already passed, reset
  useEffect(() => {
    if (timedOutStart && Date.now() - timedOutStart > TIMEOUT_SHORT) {
      setTimedOut(false)
      setTimedOutStart(null)
    }
  }, [timedOutStart, setTimedOut, setTimedOutStart])

  const confirm = ConfirmModal({
    message: 'Are you sure you want to resend the verification email?',
    onConfirm: () => {
      doMutate()
    },
  })
  const confirmLogout = ConfirmLogoutModal({
    onConfirm: () => {
      router.post(route('auth.logout'))
    },
  })

  return (
    <AuthLayout>
      <Head>
        <title>Verify Email</title>
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
        {timedOut && (
          <Alert
            title="Notice"
            color="blue"
            icon={<IconMessageCircle />}
            mt={'md'}
            className={cardClass}
          >
            {timedOutIsNew ? (
              <>
                Email verification has been sent to your email address. Please check your email and
                click the verification link that we sent to you to continue using our services.
              </>
            ) : (
              <>
                You have requested to resend the verification email, please wait a moment before
                resending.
              </>
            )}
          </Alert>
        )}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Verify Email</CardTitle>
            <CardDescription>
              We have sent a verification email to your email address. Please check your email and
              click on the verification link to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
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

              <Group justify="space-between">
                <Button disabled={mutation.isPending || timedOut} onClick={() => confirm()}>
                  {mutation.isPending && <Loader size={16} color="black" />}
                  {timedOut ? (
                    <>
                      <IconTimeDuration30 />
                      Please wait for {timerSec} seconds
                    </>
                  ) : (
                    <>Request Email Verification</>
                  )}
                </Button>

                {/* logout btn */}
                <Button
                  disabled={mutation.isPending || timedOut}
                  onClick={() => confirmLogout()}
                  color="red"
                >
                  Logout
                </Button>
              </Group>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  )
}
