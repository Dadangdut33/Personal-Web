'use client'

import { Head } from '@inertiajs/react'
import { Center, Image, Stack, Text, Title } from '@mantine/core'
import { useEffect } from 'react'

import ButtonGroup from './button_group'
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
          <ButtonGroup />
        </Stack>
      </Center>
    </>
  )
}
