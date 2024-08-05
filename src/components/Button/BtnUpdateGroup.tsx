import { Button, ButtonProps, Group } from '@mantine/core';
import { IconAlertTriangle, IconEditOff, IconPencil } from '@tabler/icons-react';
import { Save } from 'lucide-react';

export type BtnUpdateGroupProps = {
  edit: boolean;
  enableEdit: () => void;
  onSave: () => void;
  onReset: () => void;
  onRemove?: () => void;
  loadingSave: boolean;
  loadingReset: boolean;
  loadingRemove?: boolean;
  propsSave?: ButtonProps;
  propsReset?: ButtonProps;
  propsRemove?: ButtonProps;
};

export default function BtnUpdateGroup({
  edit,
  enableEdit,
  onSave,
  onReset,
  onRemove,
  loadingSave,
  loadingReset,
  loadingRemove,
  propsSave,
  propsReset,
  propsRemove,
}: BtnUpdateGroupProps) {
  if (!propsReset) propsReset = { variant: 'outline' };
  if (!propsRemove) propsRemove = { variant: 'outline' };

  return (
    <Group gap={'sm'}>
      {edit ? (
        <>
          {onRemove && (
            <Button
              loading={loadingRemove}
              color={'red'}
              leftSection={<IconAlertTriangle />}
              {...propsRemove}
              onClick={onRemove}
            >
              Clear
            </Button>
          )}
          <Button
            loading={loadingReset}
            color={'yellow'}
            leftSection={<IconEditOff />}
            {...propsReset}
            onClick={onReset}
          >
            Cancel
          </Button>
          <Button loading={loadingSave} leftSection={<Save />} {...propsSave} onClick={onSave}>
            Save
          </Button>
        </>
      ) : (
        <Button leftSection={<IconPencil />} onClick={enableEdit} color={'yellow'}>
          Edit
        </Button>
      )}
    </Group>
  );
}
