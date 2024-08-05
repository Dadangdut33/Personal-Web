'use client';

import { ConfirmLogoutModal } from '@/components/Modals/Confirm';
import Button from '@/components/ui/Button';
import { signOutAction } from '@/lib/actions/auth/logout';
import { useCSRFToken } from '@/lib/hooks';
import { IconPower } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';

export function BtnSignOutIcon() {
  const csrf = useCSRFToken();
  const mutation = useMutation({
    mutationFn: () => signOutAction(csrf),
  });
  const confirmModal = ConfirmLogoutModal(
    () => mutation.reset(),
    () => mutation.mutate()
  );

  return (
    <Button size="sm" loading={mutation.isPending} onClick={confirmModal}>
      <IconPower color="red" />
    </Button>
  );
}
