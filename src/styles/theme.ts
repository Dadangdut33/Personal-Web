"use client";

import RingLoader from "@/components/PageLoad/RingLoader";
import { createTheme, Loader } from "@mantine/core";

export const theme = createTheme({
  fontFamily: "DM Sans, Public Sans, sans-serif",
  headings: { fontFamily: "DM Sans, Public Sans, sans-serif" },
  white: "#fef2e8",
  colors: {
    dark: [
      "#f0f5fa",
      "#e1e8ed",
      "#becfdd",
      "#97b5cd",
      "#789fc0",
      "#588ab5",
      "#6491b8",
      "#204059",
      "#3d6a8f",
      "#2e5c80",
    ],
  },
  focusRing: "always",
  radius: { md: "5px" },
  defaultRadius: "md",
  shadows: {
    md: "4px 4px 10px 0px rgba(0, 0, 0, 0.1)",
  },
  components: {
    Loader: Loader.extend({
      defaultProps: {
        loaders: { ...Loader.defaultLoaders, ring: RingLoader },
        type: "ring",
      },
    }),
  },
});
