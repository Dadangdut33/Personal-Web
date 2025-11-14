'use client'

import { Head } from '@inertiajs/react'
import { Center, Image, Stack, Text, Title } from '@mantine/core'
import { useEffect } from 'react'

import ButtonGroup from './button_group'
import classes from './error.module.css'

export default function ServerError(props: { error: any }) {
  useEffect(() => {
    console.error('403 - Forbidden')
  }, [props])

  return (
    <>
      <Head>
        <title>403 - Forbidden</title>
        <meta name="description" content="Forbidden. You are not allowed to perform this action." />
      </Head>

      <Center
        style={{
          height: '100vh',
          width: '100vw',
        }}
      >
        <Stack>
          <Image ms={'auto'} me={'auto'} src={'/kawaii/403.png'} alt="forbidden" w={500} />
          <Title className={classes.title}>Forbidden</Title>
          <Text fz="md" ta="center" className={classes.description}>
            You are not allowed to perform this action.
          </Text>
          <ButtonGroup />
        </Stack>
      </Center>
    </>
  )
}
