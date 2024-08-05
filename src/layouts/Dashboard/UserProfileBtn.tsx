import { useRouter } from '@/components/Router';
import { MATCH_MOBILE_MQ } from '@/lib/constants';
import { limitString } from '@/lib/utils';
import { Avatar, Group, Loader, Text, UnstyledButton, UnstyledButtonProps } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronRight } from '@tabler/icons-react';

import classes from './UserProfileBtn.module.css';

type UserProfileButtonProps = {
  name?: string;
  username: string;
} & UnstyledButtonProps;

const UserProfileButton = ({ name, username, ...others }: UserProfileButtonProps) => {
  const router = useRouter();
  const match_width_mobile = useMediaQuery(MATCH_MOBILE_MQ);

  return (
    <UnstyledButton
      className={classes.user}
      {...others}
      variant="subtle"
      onClick={() => {
        router.push('/dashboard/akun');
      }}
      style={{ width: '100%' }}
    >
      <Group>
        <Avatar radius="xl" />
        <div style={{ flex: 1 }}>
          {name ? (
            <Text size="sm" fw={500}>
              {limitString(name, match_width_mobile ? 78 : 70)}
            </Text>
          ) : (
            <Loader size={20} type="dots" />
          )}

          <Text size="xs">{limitString(username, match_width_mobile ? 30 : 22)}</Text>
        </div>

        <IconChevronRight size="0.9rem" stroke={1.5} />
      </Group>
    </UnstyledButton>
  );
};

export default UserProfileButton;
