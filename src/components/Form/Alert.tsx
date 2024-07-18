import { ApiReturn } from "@/lib/types";
import { Alert, MantineSpacing, MantineStyleProps, StyleProp } from "@mantine/core";
import { IconAlertOctagon, IconMessageCircle } from "@tabler/icons-react";
import { CARD_SHADOW } from "@/components/ui/utils";

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
        variant={"light"}
        color="blue"
        title={customTitleSuccess || "Information"}
        icon={<IconMessageCircle />}
        w={w}
        style={{ whiteSpace: "pre-wrap" }}
        className={CARD_SHADOW}
      >
        {state.message}
      </Alert>
    );

  if (!state.success && state.message)
    return (
      <Alert
        mt={mt}
        variant="light"
        color="red"
        title={customTitleFailure || "Error!"}
        icon={<IconAlertOctagon />}
        w={w}
        style={{ whiteSpace: "pre-wrap" }}
        className={CARD_SHADOW}
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
        variant="light"
        color="blue"
        title="Information"
        icon={<IconMessageCircle />}
        w={"90%"}
        className={CARD_SHADOW}
      >
        {msg}
      </Alert>
    );

  return null;
}
