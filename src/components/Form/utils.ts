import { LoadingOverlayProps } from "@mantine/core";

export const LoadingOverlayConfig: LoadingOverlayProps = {
  zIndex: 9,
  overlayProps: { radius: "md", blur: 2 },
  loaderProps: { color: "blue", type: "bars" },
};
