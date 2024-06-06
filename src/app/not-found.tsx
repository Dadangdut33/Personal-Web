import BtnGoBack, { BtnGoHome } from "@/components/Button/BtnGoBack";
import { Center, Group, Image, Stack, Text, Title } from "@mantine/core";

import classes from "./error.module.css";

export default function NotFound() {
  return (
    <>
      <>
        <title>404 - Page Not Found</title>
        <meta
          name="description"
          content="Page not found. You may have mistyped the address, or the page may have been moved to a different URL."
        />
      </>
      <Center
        style={{
          height: "100vh",
          width: "100vw",
        }}
      >
        <Stack>
          <Image src={"/kawaii/404.png"} alt="not found" w={500} />
          <Title className={classes.title}>Page Not Found </Title>
          <Text fz="md" ta="center" className={classes.description}>
            It seems that the page you are looking for does not exist.
          </Text>
          <Group justify="center" mt="md">
            <BtnGoBack />
            <BtnGoHome />
          </Group>
        </Stack>
      </Center>
    </>
  );
}
