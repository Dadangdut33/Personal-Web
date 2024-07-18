import { Box, Loader } from "@mantine/core";

import classes from "./Loader.module.css";

export default function PageLoad({ both = true }: { both?: boolean }) {
  return (
    <Box className={both ? classes.center : classes["center-vertical"]}>
      <Loader size={50} type="ring" color="var(--main-accent)" />
    </Box>
  );
}
