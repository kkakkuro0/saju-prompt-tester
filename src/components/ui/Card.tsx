"use client";

import { ReactNode, HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

const Card = ({
  children,
  className = "",
  hoverEffect = true,
  ...props
}: CardProps) => {
  return (
    <div
      className={`
        bg-white rounded-xl shadow-md p-6 
        ${hoverEffect ? "hover:shadow-lg transition-shadow duration-300" : ""}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
