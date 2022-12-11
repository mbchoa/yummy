import classNames from "classnames";
import React from "react";

interface ILinkRenderer {
  (children: React.ReactNode): React.ReactNode;
}

interface IButtonProps {
  size: "sm" | "md" | "lg";
  onClick: () => void;
  children?: React.ReactNode;
  LeftIcon?: JSX.Element;
  RightIcon?: JSX.Element;
  color?: "primary" | "secondary";
  variant?: "contained" | "outlined" | "ghost";
  disabled?: boolean;
  linkRenderer?: ILinkRenderer;
}

export const Button = ({
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

  return (
    <>
      {linkRenderer !== undefined ? (
        linkRenderer(children)
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
