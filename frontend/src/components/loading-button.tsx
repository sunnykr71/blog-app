import {Loader2Icon} from "lucide-react";

import {Button, type ButtonProps} from "./ui/button";

interface LoadingButtonProps {
  text?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "submit" | "button" | "reset";
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  onClick?: () => void;
}

function LoadingButton({
  text = "submit",
  loading = false,
  disabled = false,
  type = "button",
  variant = "default",
  size = "default",
  className = "",
  onClick = () => {},
}: LoadingButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading || disabled}
      type={type}
      className={className}
      onClick={onClick}
    >
      {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : text}
    </Button>
  );
}

export default LoadingButton;
