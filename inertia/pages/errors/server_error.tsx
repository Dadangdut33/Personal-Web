'use client'

import { router } from '@inertiajs/core'
import { Head } from '@inertiajs/react'
import { Center, Group, Image, Stack, Text, Title } from '@mantine/core'
import { IconHome2, IconRefresh } from '@tabler/icons-react'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

import classes from './error.module.css'

export default function ServerError(props: { error: any }) {
  useEffect(() => {
    console.error(props.error)
  }, [props])

  return (
    <>
      <Head>
        <title>Server Error</title>
        <meta
          name="description"
          content="An unexpected error occurred. Please try again later or contact site owner if the problem persists."
        />
      </Head>

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
            {props.error.message}
          </Text>
          <Group justify="center" mt="md">
            <Button onClick={() => window.location.reload()}>
              <IconRefresh />
              Refresh
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
