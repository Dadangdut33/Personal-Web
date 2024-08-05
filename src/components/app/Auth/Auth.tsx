'use client';

import { FormAlert, InformationAlert } from '@/components/Form/Alert';
import { PinVerification } from '@/components/Form/PinVerification';
import { LOADING_OVERLAY_CFG } from '@/components/Form/utils';
import { Link } from '@/components/Router';
import Button from '@/components/ui/Button';
import { CARD_CLASS } from '@/components/ui/utils';
import { signInAction, verifyTwoFactorToken } from '@/lib/actions/auth/signIn';
import { PASS_REGEX } from '@/lib/constants';
import { useBaseFormMutation, useRedirectMsg } from '@/lib/hooks';
import { ApiReturn } from '@/lib/types';
import {
  Box,
  Card,
  Flex,
  Group,
  Image,
  LoadingOverlay,
  PasswordInput,
  rem,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconChevronLeft } from '@tabler/icons-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import classes from './Auth.module.css';

export function AuthPage({ title }: { title?: string }) {
  const { redirectMsg } = useRedirectMsg();
  const redirectPath = useSearchParams().get('redirect');
  const formLogin = useForm({
    initialValues: {
      username: '',
      password: '',
      redirect: redirectPath || '',
    },

    validate: {
      username: (value: string) => (value.length > 0 ? null : 'Username is required'),
      password: (value: string) => (PASS_REGEX.test(value) ? null : 'Invalid Password'),
    },
  });
  const [loginState, setLoginState] = useState<ApiReturn>({ success: false, message: '' });
  const mutation = useBaseFormMutation({
    fn: (data) => signInAction(data as FormData),
    setReturnState: setLoginState,
    cleanUp: () => formLogin.reset(),
  });

  const formTwoFactor = useForm({
    initialValues: {
      username: formLogin.values.username,
      password: formLogin.values.password,
      token: '',
      redirect: redirectPath || '',
    },
    validate: {
      username: (value: string) => (value.length > 0 ? null : 'Username is required'),
      password: (value: string) => (PASS_REGEX.test(value) ? null : 'Invalid Password'),
      token: (value: string) => (value.length === 6 ? null : 'Invalid Token'),
    },
  });
  const [twoFactorState, setTwoFactorState] = useState<ApiReturn>({ success: false, message: '' });
  const mutationTwoFactor = useBaseFormMutation({
    fn: (data) => verifyTwoFactorToken(data as FormData),
    setReturnState: setTwoFactorState,
    cleanUp: () => formTwoFactor.reset(),
  });

  useEffect(() => {
    if (redirectPath) setLoginState({ success: false, message: 'You need to login to access this page' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className={classes.wrapper} pos={'relative'}>
      <BackButtonTopLeft />
      <Image src="/assets/logo-transparent.png" alt="Logo" w={250} h={150} mb={'lg'} />
      <Flex maw={600} w={'100%'} direction={'column'} align={'center'}>
        <Title ms={'auto'} me={'auto'} order={3}>
          {title || 'Admin Panel'}
        </Title>
        <InformationAlert msg={redirectMsg} />
        <FormAlert state={loginState} />
        <FormAlert state={twoFactorState} />
        <Card
          className={CARD_CLASS}
          mt={15}
          p={30}
          pb={15}
          radius="md"
          style={{ width: '90%' }}
          ms={'auto'}
          me={'auto'}
        >
          {loginState.data && loginState.data.needsTwoFactor ? (
            <Flex direction={'column'} align={'center'} mb="md">
              <Title ms={'auto'} me={'auto'} order={3}>
                Two-Factor Authentication
              </Title>
              <PinVerification
                loading={mutationTwoFactor.isPending}
                description="Enter the 6-digit token from your authenticator app"
                pinInputProps={{
                  name: 'token',
                  size: 'md',
                  length: 6,
                }}
                formInput={formTwoFactor}
                formField="token"
                onChange={(e) => {
                  formTwoFactor.setValues({ token: `${e}` });
                }}
                onKeyUp={(e) => {
                  if (formTwoFactor.values.token.length === 6) mutationTwoFactor.mutate(formTwoFactor);
                }}
              />
            </Flex>
          ) : (
            <>
              <Stack gap={'md'} pos={'relative'} mb={'md'}>
                <LoadingOverlay visible={mutation.isPending} {...LOADING_OVERLAY_CFG} />
                <TextInput
                  label="Username"
                  placeholder="username"
                  required
                  {...formLogin.getInputProps('username')}
                  className="border-black"
                />
                <PasswordInput
                  label="Password"
                  name="password"
                  placeholder="Password"
                  required
                  {...formLogin.getInputProps('password')}
                />
              </Stack>
              <Button onClick={() => mutation.mutate(formLogin)} center loading={mutation.isPending}>
                Login
              </Button>
            </>
          )}
        </Card>
      </Flex>
    </Box>
  );
}

function BackButtonTopLeft() {
  return (
    <Box pos={'absolute'} top={6} left={6}>
      <Button href="/" component={Link}>
        <Group gap={1} align="center">
          <IconChevronLeft style={{ width: rem(14), height: rem(14) }} />
          <Text size="sm" ml={5}>
            Home
          </Text>
        </Group>
      </Button>
    </Box>
  );
}
