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
import { CrownIcon, StarIcon } from "lucide-react";
import { useListCustomers } from "../queries/list-customer";

interface CustomerOption {
  value: string;
  label: string;
  isDecisionMaker: boolean;
  isPrimaryContact: boolean;
}

interface CustomerComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  ariaInvalid?: boolean;
  unassigned?: boolean;
  showClear?: boolean;
}

export function CustomerCombobox({
  value,
  onValueChange,
  disabled,
  placeholder = "Select a customer...",
  id,
  ariaInvalid,
  unassigned,
  showClear,
}: CustomerComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue.trim(), 300);

  const { data } = useListCustomers({
    page: 1,
    perPage: 50,
    search: debouncedSearch || undefined,
    unassigned,
    sortBy: "fullName",
    sortDir: "asc",
  });

  const options: CustomerOption[] = useMemo(
    () =>
      (data?.customers ?? []).map((customer) => ({
        value: customer.id,
        label: customer.jobTitle
          ? `${customer.fullName} — ${customer.jobTitle}`
          : customer.fullName,
        isDecisionMaker: customer.isDecisionMaker,
        isPrimaryContact: customer.isPrimaryContact,
      })),
    [data],
  );

  const [selectedOption, setSelectedOption] = useState<CustomerOption | null>(
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
                <span className="flex items-center gap-1.5">
                  {item.isDecisionMaker && (
                    <CrownIcon className="size-4 text-amber-500" />
                  )}
                  {item.isPrimaryContact && (
                    <StarIcon className="size-4 text-amber-500" />
                  )}
                </span>
              </ComboboxItem>
            )}
          </ComboboxCollection>
          <ComboboxEmpty>No unassigned customers found.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}