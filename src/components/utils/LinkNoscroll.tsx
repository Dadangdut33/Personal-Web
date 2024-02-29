import Link, { LinkProps } from "next/link";
import React, { ReactNode } from "react";

interface IProps extends LinkProps {
  children: ReactNode;
  className?: string;
}

export const LinkNoScroll = ({ children, href, className }: IProps): JSX.Element => (
  <Link href={href} scroll={false} className={className}>
    {children}
  </Link>
);
