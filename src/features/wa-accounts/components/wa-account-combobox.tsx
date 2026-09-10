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
import { useListWaAccounts } from "../queries/list-wa-account";

interface WaAccountOption {
  value: string;
  label: string;
}

interface WaAccountComboboxProps {
  onValueChange: (value: string) => void;
  placeholder?: string;
  showClear?: boolean;
}

export function WaAccountCombobox({
  onValueChange,
  placeholder = "Select an account...",
  showClear = false,
}: WaAccountComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState<WaAccountOption | null>(null);
  const debouncedSearch = useDebounce(inputValue.trim(), 300);

  const { data } = useListWaAccounts({
    page: 1,
    perPage: 50,
    search: debouncedSearch || undefined,
    sortBy: "label",
    sortDir: "asc",
  });

  const options: WaAccountOption[] = (data?.waAccounts ?? []).map((account) => ({
    value: account.id,
    label: account.label ? `${account.label} (${account.phone})` : account.phone,
  }));

  return (
    <Combobox
      value={selected}
      onValueChange={(next) => {
        setSelected(next ?? null);
        onValueChange(next?.value ?? "");
      }}
      onInputValueChange={setInputValue}
      items={options}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
    >
      <ComboboxInput placeholder={placeholder} showClear={showClear} />
      <ComboboxContent>
        <ComboboxList>
          <ComboboxCollection>
            {(item) => (
              <ComboboxItem key={item.value} value={item}>
                <span className="flex-1">{item.label}</span>
              </ComboboxItem>
            )}
          </ComboboxCollection>
          <ComboboxEmpty>No accounts found.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}