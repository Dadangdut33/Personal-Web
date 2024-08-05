import { ActionIcon, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';

export default function ActionEditDelete({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <>
      <Tooltip events={{ hover: true, focus: true, touch: true }} label="Edit Data" withArrow>
        <ActionIcon variant="gradient" onClick={onEdit}>
          <IconPencil />
        </ActionIcon>
      </Tooltip>
      <Tooltip events={{ hover: true, focus: true, touch: true }} label="Delete Data" withArrow>
        <ActionIcon color="red" onClick={onDelete}>
          <IconTrash />
        </ActionIcon>
      </Tooltip>
    </>
  );
}
