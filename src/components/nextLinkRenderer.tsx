import type { LinkProps } from "next/link";
import Link from "next/link";
import React from "react";

export const NextLinkRenderer = (linkProps: LinkProps) => {
  const NextLinkRendererWrapper = (children: React.ReactNode, cx: string) => {
    return (
      <Link {...linkProps} className={cx}>
        {children}
      </Link>
    );
  };

  return NextLinkRendererWrapper;
};
