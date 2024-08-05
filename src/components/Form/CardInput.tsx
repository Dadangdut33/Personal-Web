import Surface from '@/components/Surface';
import { Box, Group, Indicator, Paper, PaperProps, Text, Title } from '@mantine/core';

import classess from './CardInput.module.css';

interface CardProps {
  params: {
    header: string;
    description: string;
    subDesc?: string;
  };
  children: React.ReactNode;
}

const CardStyle: PaperProps = {
  shadow: 'md',
  radius: 'md',
};

export function CardInput({ params, children }: CardProps) {
  const { header, description, subDesc } = params;
  return (
    <Surface component={Paper} {...CardStyle}>
      <Box p={'md'}>
        <Title order={3} className="text-xl font-semibold">
          {header}
        </Title>
        <Text>{description}</Text>
        {subDesc && (
          <Text size="xs" c={'dimmed'}>
            {subDesc}
          </Text>
        )}
      </Box>
      {children}
    </Surface>
  );
}

export function CardInputBody({ children }: { children: React.ReactNode }) {
  return <Box px={'md'}>{children}</Box>;
}

export function CardInputFooter({ description, children }: { children: React.ReactNode; description: string }) {
  return (
    <Group justify="space-between" p={'sm'} className={classess.footer + ' rounded-b-lg'}>
      <Text size="sm">
        {description && (
          <Indicator ms="xs" ps={'xs'} position="middle-start" color="blue" processing>
            {description}
          </Indicator>
        )}
      </Text>
      {children}
    </Group>
  );
}
