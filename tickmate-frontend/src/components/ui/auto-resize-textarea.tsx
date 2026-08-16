"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type AutoResizeTextareaProps = React.ComponentProps<"textarea">;

function AutoResizeTextarea({
  className,
  rows = 4,
  onInput,
  ...props
}: AutoResizeTextareaProps) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const resize = React.useCallback(() => {
    const element = ref.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, []);

  return (
    <textarea
      data-slot="textarea"
      ref={ref}
      rows={rows}
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex min-h-16 w-full resize-none rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
      {...props}
    />
  );
}

export { AutoResizeTextarea };