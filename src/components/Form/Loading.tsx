import { LoadingOverlay } from "@mantine/core";

export function BaseLoadingOverlay({ loading }: { loading: boolean }) {
  return (
    <LoadingOverlay
      visible={loading}
      zIndex={9}
      overlayProps={{ radius: "md", blur: 2 }}
      loaderProps={{ color: "blue", type: "bars" }}
    />
  );
}
