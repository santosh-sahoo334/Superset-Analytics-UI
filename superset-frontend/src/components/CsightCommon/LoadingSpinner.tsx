/* eslint-disable */
import React from "react";
import { ProgressSpinner } from "primereact/progressspinner";

interface LoadingSpinnerProps {
  strokeWidth?: string;
  color?: string;
  size?: string;
  animationDuration?: string;
  ariaLabel?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  strokeWidth = "4",
  color = "#4472c4",
  size = "50px",
  animationDuration = "3s",
  ariaLabel = "Loading",
  ...props
}) => {
  return (
    <ProgressSpinner
      strokeWidth={strokeWidth}
      aria-label={ariaLabel}
      style={{ color, width: size, height: size }}
      animationDuration={animationDuration}
      {...props}
    />
  );
};

export default LoadingSpinner;
