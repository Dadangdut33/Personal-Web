import { ActionIcon, Button, MantineColor, Popover, PopoverDropdown, PopoverTarget } from "@mantine/core";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { ReactNode } from "react";

export default function BatchAction({
  disabled,
  doFn,
  doText,
  icon,
  color,
}: {
  disabled: boolean;
  doFn: () => void;
  doText: string;
  icon: ReactNode;
  color: MantineColor;
}) {
  return (
    <Popover>
      <PopoverTarget>
        <ActionIcon variant="subtle" disabled={disabled}>
          <IconDotsVertical />
        </ActionIcon>
      </PopoverTarget>
      <PopoverDropdown>
        <Button onClick={doFn} leftSection={icon} color={color}>
          Batch {doText}
        </Button>
      </PopoverDropdown>
    </Popover>
  );
}

export function BatchDelete({ disabled, doFn, doText }: { disabled: boolean; doFn: () => void; doText: string }) {
  return <BatchAction disabled={disabled} doFn={doFn} doText={"Hapus " + doText} icon={<IconTrash />} color="red" />;
}
