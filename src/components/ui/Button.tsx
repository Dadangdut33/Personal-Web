'use client';

import { cn } from '@/lib/utils';
import { Box, createPolymorphicComponent, LoadingOverlay, MantineStyleProps } from '@mantine/core';
import { ClassValue } from 'clsx';
import { forwardRef } from 'react';

import { LOADING_OVERLAY_CFG } from '../Form/utils';

export type ButtonProps = {
  className?: ClassValue;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'default' | 'lg' | 'sm' | 'xs' | 'icon';
  disabled?: boolean;
  ref?: React.ForwardedRef<HTMLButtonElement>;
  loading?: boolean;
  center?: boolean;
};

const sizeMap = {
  xs: 'btn-size-xs',
  sm: 'btn-size-sm',
  default: 'btn-size-default',
  lg: 'btn-size-lg',
  icon: 'btn-size-icon',
};

export const BaseButton = ({
  className,
  children,
  onClick,
  size = 'default',
  disabled = false,
  ref = null,
  loading,
  center,
  ...others
}: ButtonProps) => {
  return (
    <Box
      ref={ref}
      component="button"
      aria-label="Click to perform an action"
      onClick={(e) => {
        if (loading) return;
        if (onClick) onClick(e);
      }}
      className={cn(
        `flex text-text cursor-pointer items-center rounded-base border-2 border-border
        dark:border-darkBorder bg-main text-sm font-base shadow-light dark:shadow-dark
        transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none
        dark:hover:shadow-none disabled:btn-active disabled:bg-disabled`,
        sizeMap[size],
        disabled ? 'no-shadow cursor-not-allowed' : 'hover:bg-main',
        loading && 'cursor-not-allowed no-shadow',
        className
      )}
      disabled={disabled || loading}
      {...others}
      pos={'relative'}
    >
      <LoadingOverlay visible={loading} {...LOADING_OVERLAY_CFG} />
      {center ? (
        <Box ms={'auto'} me={'auto'}>
          {children}
        </Box>
      ) : (
        <>{children}</>
      )}
    </Box>
  );
};

// Base: https://neobrutalism-components.vercel.app/react/components/Button
export const BtnActiveClass: ClassValue = 'btn-active no-shadow bg-main ';
const Button = createPolymorphicComponent<'button', ButtonProps & MantineStyleProps>(
  // eslint-disable-next-line react/display-name
  forwardRef<HTMLButtonElement, ButtonProps & MantineStyleProps>((parameters, ref) => (
    <BaseButton {...parameters} ref={ref} />
  ))
);
Button.displayName = 'Button';

export default Button;
