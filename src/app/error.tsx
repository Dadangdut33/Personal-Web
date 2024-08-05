'use client';

import { useRouter } from '@/components/Router';
import { BaseButton } from '@/components/ui/Button';
import { Center, Group, Image, Button as MantineButton, Stack, Text, Title } from '@mantine/core';
import { IconHome2, IconRefresh } from '@tabler/icons-react';
import { useEffect } from 'react';

import classes from './error.module.css';

function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <>
      <>
        <title>Server Error</title>
        <meta
          name="description"
          content="An unexpected error occurred. Please try again later or contact site owner if the problem persists."
        />
      </>
      <Center
        style={{
          height: '100vh',
          width: '100vw',
        }}
      >
        <Stack>
          <Image ms={'auto'} me={'auto'} src={'/kawaii/500.png'} alt="not found" w={500} />
          <Title className={classes.title}>Sorry, an unexpected error occurred</Title>
          <Text fz="md" ta="center" className={classes.description}>
            {error.toString()}
          </Text>
          <Group justify="center" mt="md">
            <MantineButton
              size="md"
              leftSection={<IconRefresh size={18} />}
              component={BaseButton}
              onClick={() => window.location.reload()}
            >
              Refresh
            </MantineButton>
            <MantineButton
              size="md"
              variant="default"
              leftSection={<IconHome2 size={18} />}
              component={BaseButton}
              onClick={() => router.push('/')}
            >
              Back to Home
            </MantineButton>
          </Group>
        </Stack>
      </Center>
    </>
  );
}

export default Error;
