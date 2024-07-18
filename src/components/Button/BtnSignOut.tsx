"use client";

import { signOutAction } from "@/lib/actions/auth/logout";
import { ActionIcon, Tooltip } from "@mantine/core";
import { IconPower } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";

import { ConfirmLogoutModal } from "../Modals/Confirm";

export function BtnSignOutIcon() {
  const mutation = useMutation({
    mutationFn: () => signOutAction(),
  });
  const confirmModal = ConfirmLogoutModal(
    () => mutation.reset(),
    () => mutation.mutate()
  );

  return (
    <Tooltip events={{ hover: true, focus: true, touch: true }} label="Logout">
      <ActionIcon
        variant="filled"
        color="red"
        type="submit"
        loading={mutation.isPending}
        onClick={confirmModal}
        size={"lg"}
      >
        <IconPower />
      </ActionIcon>
    </Tooltip>
  );
}
