'use client';

import { Divider, Flex, NotificationProps, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

export function NotifyError(title: string, message: string = '', others?: NotificationProps) {
  return notifications.show({
    title,
    message: (
      <Stack gap={4}>
        <Text size="sm">{message}</Text>
        <Flex justify={'left'}>
          <Divider className="hr-error" />
        </Flex>
      </Stack>
    ),
    color: 'red',
    autoClose: 8000,
    ...others,
  });
}

export function NotifySuccess(title: string, message: string = '', others?: NotificationProps) {
  return notifications.show({
    title,
    message: (
      <Stack gap={4}>
        <Text size="sm">{message}</Text>
        <Flex justify={'left'}>
          <Divider className="hr-success" />
        </Flex>
      </Stack>
    ),
    color: 'green',
    autoClose: 4000,
    ...others,
  });
}

export function NotifyInfo(title: string, message: string = '', others?: NotificationProps) {
  return notifications.show({
    title,
    message: (
      <Stack gap={4}>
        <Text size="sm">{message}</Text>
        <Flex justify={'left'}>
          <Divider className="hr-info" />
        </Flex>
      </Stack>
    ),
    color: 'blue',
    autoClose: 5000,
    ...others,
  });
}

export function NotifyWarning(title: string, message: string = '', others?: NotificationProps) {
  return notifications.show({
    title,
    message: (
      <Stack gap={4}>
        <Text size="sm">{message}</Text>
        <Flex justify={'left'}>
          <Divider className="hr-warning" />
        </Flex>
      </Stack>
    ),
    color: 'yellow',
    autoClose: 6000,
    ...others,
  });
}
