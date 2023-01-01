import classNames from "classnames";
import React from "react";

interface ILinkRenderer {
  (children: React.ReactNode, cx: string): React.ReactNode;
}

interface IButtonProps {
  isLoading?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: any; // TODO: some button handlers are async, some are not, need to figure out how to type this
  children?: React.ReactNode;
  LeftIcon?: JSX.Element;
  RightIcon?: JSX.Element;
  color?: "primary" | "secondary";
  variant?: "contained" | "outlined" | "ghost";
  disabled?: boolean;
  linkRenderer?: ILinkRenderer;
}

export const Button = ({
  isLoading = false,
  children,
  size = "md",
  onClick,
  LeftIcon,
  RightIcon,
  color = "primary",
  variant = "contained",
  disabled = false,
  linkRenderer,
}: IButtonProps) => {
  const cx = classNames(
    "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none h-min",

    color === "primary" &&
      variant === "contained" &&
      "text-white bg-indigo-600 focus:ring-indigo-600 focus:ring-2 focus:ring-offset-2",
    color === "primary" &&
      variant === "outlined" &&
      "border-indigo-600 focus:ring-2 focus:ring-offset-2 border-1 focus:ring-indigo-600",
    color === "primary" && variant === "ghost" && "text-indigo-600 shadow-none",

    color === "secondary" &&
      variant === "contained" &&
      "text-white bg-violet-400 focus:ring-violet-400 focus:ring-2 focus:ring-offset-2",
    color === "secondary" &&
      variant === "outlined" &&
      "border-violet-400 focus:ring-2 focus:ring-offset-2 border-1 focus:ring-violet-400",
    color === "secondary" &&
      variant === "ghost" &&
      "text-violet-400 shadow-none",

    size === "sm" && "px-2 py-1 text-xs",
    size === "md" && "px-4 py-2 text-sm",
    size === "lg" && "px-6 py-3 text-base",
    disabled ? "opacity-50 cursor-not-allowed" : ""
  );

  if (isLoading) {
    return (
      <button className={classNames(cx, "justify-center")} disabled={true}>
        <svg
          className="h-5 w-5 animate-spin text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v1a7 7 0 00-7 7h1z"
          ></path>
        </svg>
        <span className="sr-only">Loading</span>
      </button>
    );
  }
  return (
    <>
      {linkRenderer !== undefined ? (
        linkRenderer(children, cx)
      ) : (
        <button className={cx} disabled={disabled} onClick={onClick}>
          {LeftIcon}
          {children}
          {RightIcon}
        </button>
      )}
    </>
  );
};
