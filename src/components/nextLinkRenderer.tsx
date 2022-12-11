import type { LinkProps } from "next/link";
import Link from "next/link";
import type { Route } from "nextjs-routes";
import React from "react";

export const NextLinkRenderer = (linkProps: LinkProps<Route>) => {
  const NextLinkRendererWrapper = (children: React.ReactNode, cx: string) => {
    return (
      <Link {...linkProps} className={cx}>
        {children}
      </Link>
    );
  };

  return NextLinkRendererWrapper;
};
