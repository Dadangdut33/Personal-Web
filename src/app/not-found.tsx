import BtnGoBack from "@/components/Button/BtnGoBack";
import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { IconHome2 } from "@tabler/icons-react";
import Link from "next/link";

import classes from "./error.module.css";

export default function NotFound() {
  return (
    <>
      <>
        <title>404 - Page Not Found</title>
        <meta
          name="description"
          content="Halaman tidak ditemukan. Anda mungkin salah mengetik alamat, atau halaman telah dipindahkan ke URL lain."
        />
      </>
      <Center
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        <Stack>
          <div className={classes.label}>404</div>
          <Title className={classes.title}>Halaman tidak ditemukan</Title>
          <Text fz="md" ta="center" className={classes.description}>
            Sepertinya halaman yang Anda cari tidak ada. Anda mungkin salah mengetik alamat, atau halaman yang anda tuju
            telah dipindahkan ke URL lain.
          </Text>
          <Group justify="center" mt="md">
            <BtnGoBack />
            <Button size="md" variant="subtle" leftSection={<IconHome2 size={18} />} component={Link} href={"/"}>
              Ke halaman utama
            </Button>
          </Group>
        </Stack>
      </Center>
    </>
  );
}
