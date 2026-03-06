"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "./utils";

function Switch({
  className,
  checked,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      checked={checked}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full",
        "border-2 border-transparent",
        "transition-colors duration-200 ease-in-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      // inline style 驱动颜色，不依赖 Tailwind data variant（兼容 v4）
      style={{ backgroundColor: checked ? "#2563eb" : "#d1d5db" }}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out"
        // 容器 48px，内边距 2px，圆点 20px；关: 2px, 开: 22px（2+20+4=26 ≤ 44）
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
