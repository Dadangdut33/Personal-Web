import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";

export function ConfirmModal(text: string | JSX.Element, onCancel: () => void, onConfirm: () => void, other?: any) {
  const modal = () =>
    modals.openConfirmModal({
      title: "Confirm Your Action",
      centered: true,
      withCloseButton: false,
      children: <Text size="sm">{text}</Text>,
      labels: { confirm: "Yes", cancel: "Cancel" },
      onCancel,
      onConfirm,
      ...other,
    });

  return modal;
}

export function ConfirmAddModal(onCancel: () => void, onConfirm: () => void, data?: string) {
  return ConfirmModal(`Are you sure you want to save ${data || "this data"}?`, onCancel, onConfirm);
}

export function ConfirmResetModal(onCancel: () => void, onConfirm: () => void, data?: string) {
  return ConfirmModal(`Are you sure you want to reset ${data || "this data"}?`, onCancel, onConfirm);
}

export function ConfirmDeleteModal(onCancel: () => void, onConfirm: () => void, data?: string, extra?: string) {
  return ConfirmModal(`Are you sure you want to delete 🗑️ ${data || "this data"}?${extra}`, onCancel, onConfirm, {
    confirmProps: { color: "red" },
  });
}

export function ConfirmLogoutModal(onCancel: () => void, onConfirm: () => void) {
  return ConfirmModal("Are you sure you want to logout?", onCancel, onConfirm, {
    confirmProps: { color: "red" },
  });
}
