"use client";

import { useState } from "react";
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
import { useListCustomerOrganizations } from "../queries/list-customer-organization";

interface CustomerOrganizationOption {
  value: string;
  label: string;
}

interface CustomerOrganizationComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  ariaInvalid?: boolean;
  showClear?: boolean;
}

export function CustomerOrganizationCombobox({
  value,
  onValueChange,
  disabled,
  placeholder = "Select an organization...",
  id,
  ariaInvalid,
  showClear,
}: CustomerOrganizationComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue.trim(), 300);

  const { data } = useListCustomerOrganizations({
    page: 1,
    perPage: 50,
    search: debouncedSearch || undefined,
    sortBy: "name",
    sortDir: "asc",
  });

  const options: CustomerOrganizationOption[] = (
    data?.customerOrganizations ?? []
  ).map((organization) => ({
    value: organization.id,
    label: organization.legalName ?? organization.name,
  }));

  const selected =
    options.find((option) => option.value === value) ?? null;

  return (
    <Combobox
      value={selected}
      onValueChange={(next) => onValueChange(next?.value ?? "")}
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
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxCollection>
          <ComboboxEmpty>No organizations found.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}