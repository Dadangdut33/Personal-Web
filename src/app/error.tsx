"use client";

import classes from "@/styles/error.module.css";
import { Button, Container, Group, Text, Title } from "@mantine/core";
import { Metadata, NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  statusCode?: string;
}

export const metadata: Metadata = {
  title: "500 - Unexpected Error",
  description: "Something bad just happened...",
};

const Error: NextPage<Props> = ({ statusCode }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const btnClick = () => {
    if (searchParams.size > 0) router.back();
    else router.refresh();
  };

  return (
    <>
      {/* <Wrapper noHeader noFooter>
        <div className={classes.root}>
          <Container>
            <div className={classes.label}>{statusCode || 500}</div>
            <Title className={classes.title}>Something bad just happened...</Title>
            <Text size="lg" align="center" className={classes.description}>
              Our servers could not handle your request. It might be down for a moment. Try refreshing the page.
              <Text size="xs" align="center" mt="1rem">
                (Check browser console for more details)
              </Text>
            </Text>
            <Group position="center">
              <Button size="md" onClick={btnClick}>
                Refresh the page
              </Button>
            </Group>
          </Container>
        </div>
      </Wrapper> */}
    </>
  );
};

export default Error;
