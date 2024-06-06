"use client";

import { Box, BoxProps, PaperProps, createPolymorphicComponent } from "@mantine/core";
import { ReactNode, forwardRef } from "react";

export type SurfaceProps = { children: ReactNode } & BoxProps & PaperProps;
const Surface = createPolymorphicComponent<"div", SurfaceProps>(
  // eslint-disable-next-line react/display-name
  forwardRef<HTMLDivElement, SurfaceProps>(({ children, ...others }, ref) => (
    <Box component="div" {...others} ref={ref}>
      {children}
    </Box>
  ))
);

export default Surface;
