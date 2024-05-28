import { Text } from "@mantine/core";
import { modals } from "@mantine/modals";

export function ConfirmModal(text: string | JSX.Element, onCancel: () => void, onConfirm: () => void, other?: any) {
  const modal = () =>
    modals.openConfirmModal({
      title: "Konfirmasi Tindakan Anda",
      centered: true,
      withCloseButton: false,
      children: <Text size="sm">{text}</Text>,
      labels: { confirm: "Iya", cancel: "Cancel" },
      onCancel,
      onConfirm,
      ...other,
    });

  return modal;
}

export function ConfirmAddModal(onCancel: () => void, onConfirm: () => void, data?: string) {
  return ConfirmModal(`Apakah anda yakin ingin menyimpan ${data || "data ini"}?`, onCancel, onConfirm);
}

export function ConfirmResetModal(onCancel: () => void, onConfirm: () => void, data?: string) {
  return ConfirmModal(`Apakah anda yakin ingin mereset ${data || "data ini"}?`, onCancel, onConfirm);
}

export function ConfirmDeleteModal(onCancel: () => void, onConfirm: () => void, data?: string, extra?: string) {
  return ConfirmModal(`Apakah anda yakin ingin menghapus 🗑️ ${data || "data ini"}?${extra}`, onCancel, onConfirm, {
    confirmProps: { color: "red" },
  });
}

export function ConfirmLogoutModal(onCancel: () => void, onConfirm: () => void) {
  return ConfirmModal("Apakah anda yakin ingin keluar?", onCancel, onConfirm, {
    confirmProps: { color: "red" },
  });
}
