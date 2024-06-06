import { ApiReturn } from "@/lib/types";
import { Alert, MantineSpacing, MantineStyleProps, StyleProp } from "@mantine/core";
import { IconAlertOctagon, IconMessageCircle } from "@tabler/icons-react";

export function FormAlert({
  state,
  customTitleSuccess,
  customTitleFailure,
  mt = "md",
  w = "90%",
}: {
  state: ApiReturn;
  customTitleSuccess?: string;
  customTitleFailure?: string;
  mt?: StyleProp<MantineSpacing>;
  w?: MantineStyleProps["w"];
}) {
  if (state.success && state.message)
    return (
      <Alert
        mt={mt}
        variant={"outline"}
        color="blue"
        title={customTitleSuccess || "Informasi"}
        icon={<IconMessageCircle />}
        w={w}
        style={{ whiteSpace: "pre-wrap" }}
      >
        {state.message}
      </Alert>
    );

  if (!state.success && state.message)
    return (
      <Alert
        mt={mt}
        variant="outline"
        color="red"
        title={customTitleFailure || "Terjadi Kesalahan!"}
        icon={<IconAlertOctagon />}
        w={w}
        style={{ whiteSpace: "pre-wrap" }}
      >
        {state.message}
      </Alert>
    );
}

export function InformationAlert({ msg, withMt = true }: { msg?: string | null; withMt?: boolean }) {
  if (msg)
    return (
      <Alert
        mt={withMt ? "md" : 0}
        variant="outline"
        color="blue"
        title="Informasi"
        icon={<IconMessageCircle />}
        w={"90%"}
      >
        {msg}
      </Alert>
    );

  return null;
}
