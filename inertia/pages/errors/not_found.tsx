'use client'

import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { Center, Group, Image, Stack, Text, Title } from '@mantine/core'
import { IconArrowLeft, IconHome2 } from '@tabler/icons-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

import classes from './error.module.css'

export default function ServerError(props: { error: any }) {
  useEffect(() => {
    console.error('404 - Page Not Found')
  }, [props])

  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta
          name="description"
          content="Page not found. You may have mistyped the address, or the page may have been moved to a different URL."
        />
      </Head>

      <Center
        style={{
          height: '100vh',
          width: '100vw',
        }}
      >
        <Stack>
          <Image ms={'auto'} me={'auto'} src={'/kawaii/404.png'} alt="not found" w={500} />
          <Title className={classes.title}>Page Not Found </Title>
          <Text fz="md" ta="center" className={classes.description}>
            It seems that the page you are looking for does not exist.
          </Text>
          <Group justify="center" mt="md">
            <Button onClick={() => window.history.back()}>
              <IconArrowLeft />
              Go Back
            </Button>
            <Button variant="neutral" onClick={() => router.visit('/')}>
              <IconHome2 />
              Back to Home
            </Button>
          </Group>
        </Stack>
      </Center>
    </>
  )
}
