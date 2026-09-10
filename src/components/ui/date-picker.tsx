"use client";

import * as React from "react";
import { CalendarIcon, XIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  variant?: "button" | "input";
  "aria-invalid"?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  variant = "button",
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState(
    value ? format(value, "PPP") : "",
  );
  const [prevValue, setPrevValue] = React.useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setInputValue(value ? format(value, "PPP") : "");
  }

  const handleSelect = (date: Date | undefined) => {
    setInputValue(date ? format(date, "PPP") : "");
    onChange?.(date);
  };

  if (variant === "input") {
    return (
      <Popover>
        <PopoverTrigger
          nativeButton={false}
          render={
            <div className={cn("relative", className)}>
              <Input
                className="ps-9 pe-9"
                placeholder={placeholder}
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (!e.target.value) onChange?.(undefined);
                }}
                disabled={disabled}
                aria-invalid={ariaInvalid}
              />
              <CalendarIcon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              {value ? (
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  className="absolute end-1 top-1/2 size-6 -translate-y-1/2"
                  onClick={() => {
                    setInputValue("");
                    onChange?.(undefined);
                  }}
                  tabIndex={-1}
                >
                  <XIcon className="size-4 text-muted-foreground" />
                </Button>
              ) : null}
            </div>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-start gap-2 font-normal",
              !value && "text-muted-foreground",
              className,
            )}
          >
            <CalendarIcon className="size-4 shrink-0" />
            {value ? format(value, "PPP") : <span>{placeholder}</span>}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}