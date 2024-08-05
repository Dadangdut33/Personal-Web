import { Box, Center, Input, LoadingOverlay, PinInput, Text, type PinInputProps } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';

import { LOADING_OVERLAY_CFG } from './utils';

export const PinVerification = ({
  description,
  pinInputProps,
  formInput,
  formField,
  onChange,
  onKeyUp,
  loading,
  centerPin,
}: {
  description?: string;
  loading?: boolean;
  pinInputProps?: PinInputProps;
  formInput: UseFormReturnType<any>;
  formField: string;
  onChange: (e: string) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  centerPin?: boolean;
}) => {
  return (
    <>
      {description && (
        <Text c="dimmed" size="xs" mt={'lg'} mb={5} ta={'center'}>
          {description}
        </Text>
      )}
      <Box pos={'relative'}>
        <LoadingOverlay visible={loading} {...LOADING_OVERLAY_CFG} />
        {centerPin ? (
          <Center>
            <PinInput
              ta={'center'}
              placeholder=""
              type="number"
              {...formInput.getInputProps(formField)}
              onChange={onChange}
              onKeyUp={onKeyUp}
              {...pinInputProps}
              disabled={loading}
            />
          </Center>
        ) : (
          <PinInput
            ta={'center'}
            placeholder=""
            type="number"
            {...formInput.getInputProps(formField)}
            onChange={onChange}
            onKeyUp={onKeyUp}
            {...pinInputProps}
            disabled={loading}
          />
        )}
      </Box>
      <Input.Error mt={'sm'}>{formInput.errors[formField]}</Input.Error>
    </>
  );
};
