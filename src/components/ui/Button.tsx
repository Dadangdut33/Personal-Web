"use client";

import { cn } from "@/lib/utils";
import { Box, createPolymorphicComponent, LoadingOverlay, MantineStyleProps } from "@mantine/core";
import { ClassValue } from "clsx";
import { forwardRef } from "react";
import { LOADING_OVERLAY_CFG } from "../Form/utils";

type Props = {
  className?: ClassValue;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  size?: "default" | "lg" | "sm" | "icon";
  disabled?: boolean;
  ref?: React.ForwardedRef<HTMLButtonElement>;
  loading?: boolean;
  center?: boolean;
};

const sizeMap = {
  default: "btn-size-default",
  lg: "btn-size-lg",
  sm: "btn-size-sm",
  icon: "btn-size-icon",
};

export const BaseButton = ({
  className,
  children,
  onClick,
  size = "default",
  disabled = false,
  ref,
  loading,
  center,
  ...others
}: Props) => {
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
        `flex cursor-pointer items-center rounded-base border-2 border-black text-sm disabled:bg-disabled font-base shadow-base
        transition-all hover:btn-active disabled:btn-active`,
        sizeMap[size],
        !disabled ? "hover:bg-main dark:hover:bg-main-dark" : "",
        className
      )}
      disabled={disabled}
      {...others}
      pos={"relative"}
    >
      <LoadingOverlay visible={loading} {...LOADING_OVERLAY_CFG} />
      {center ? (
        <Box ms={"auto"} me={"auto"}>
          {children}
        </Box>
      ) : (
        <>{children}</>
      )}
    </Box>
  );
};

// Base: https://neobrutalism-components.vercel.app/react/components/Button
export const BtnActiveClass: ClassValue = "btn-active shadow-none bg-main dark:bg-main-dark";
const Button = createPolymorphicComponent<"button", Props & MantineStyleProps>(
  // eslint-disable-next-line react/display-name
  forwardRef<HTMLButtonElement, Props & MantineStyleProps>((parameters, ref) => (
    <BaseButton {...parameters} ref={ref} />
  ))
);
Button.displayName = "Button";

export default Button;
