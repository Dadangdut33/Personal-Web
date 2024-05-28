"use client";

import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { IconHome2, IconRefresh } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import classes from "./error.module.css";

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
          content="Halaman gagal dimuat karena terjadi kesalahan yang tidak terduga. Silakan coba muat ulang halaman ini."
        />
      </>
      <Center
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        <Stack>
          <div className={classes.label}>500</div>
          <Title className={classes.title}>Maaf, terjadi kesalahan yang tidak terduga..</Title>
          <Text fz="md" ta="center" className={classes.description}>
            {error.toString()}
          </Text>
          <Group justify="center" mt="md">
            <Button
              size="md"
              leftSection={<IconRefresh size={18} />}
              variant="subtle"
              onClick={() => window.location.reload()}
            >
              Muat ulang halaman
            </Button>
            <Button size="md" variant="subtle" leftSection={<IconHome2 size={18} />} onClick={() => router.push("/")}>
              Ke halaman utama
            </Button>
          </Group>
        </Stack>
      </Center>
    </>
  );
}

export default Error;
