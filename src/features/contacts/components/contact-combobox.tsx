"use client";

import { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useDebounce } from "@/hooks/use-debounce";
import { useListContacts } from "../queries/list-contact";

interface ContactOption {
  value: string;
  label: string;
  phone: string;
}

interface ContactComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  customerId?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  ariaInvalid?: boolean;
  showClear?: boolean;
  unassigned?: boolean;
}

export function ContactCombobox({
  value,
  onValueChange,
  customerId,
  disabled,
  placeholder = "Select a contact...",
  id,
  ariaInvalid,
  showClear,
  unassigned,
}: ContactComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue.trim(), 300);

  const { data } = useListContacts({
    page: 1,
    perPage: 50,
    search: debouncedSearch || undefined,
    customerId,
    unassigned,
    sortBy: "displayName",
    sortDir: "asc",
  });

  const options: ContactOption[] = useMemo(
    () =>
      (data?.contacts ?? []).map((contact) => ({
        value: contact.id,
        label: contact.displayName,
        phone: contact.phone,
      })),
    [data],
  );

  const [selectedOption, setSelectedOption] = useState<ContactOption | null>(
    null,
  );

  const foundOption = options.find((option) => option.value === value);

  if (value && foundOption && selectedOption?.value !== value) {
    setSelectedOption(foundOption);
  } else if (!value && selectedOption !== null) {
    setSelectedOption(null);
  }

  const selected =
    selectedOption?.value === value ? selectedOption : foundOption;

  return (
    <Combobox
      value={selected}
      onValueChange={(next) => {
        setSelectedOption(next);
        onValueChange(next?.value ?? "");
      }}
      onInputValueChange={setInputValue}
      items={options}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        showClear={showClear}
      />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxCollection>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                <span className="flex-1">{item.label}</span>
                <span className="text-sm text-muted-foreground">
                  {item.phone}
                </span>
              </ComboboxItem>
            )}
          </ComboboxCollection>
          <ComboboxEmpty>No contacts found.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}