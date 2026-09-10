"use client";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useListUsers } from "../queries/list-user";

interface UserOption {
  value: string;
  label: string;
}

interface UserComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  ariaInvalid?: boolean;
}

export function UserCombobox({
  value,
  onValueChange,
  disabled,
  placeholder = "Select a member...",
  id,
  ariaInvalid,
}: UserComboboxProps) {
  const { data } = useListUsers({
    page: 1,
    perPage: 100,
    sortBy: "name",
    sortDir: "asc",
  });

  const options: UserOption[] = (data?.users ?? []).map((user) => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  }));

  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <Combobox
      value={selected}
      onValueChange={(next) => onValueChange(next?.value ?? "")}
      items={options}
      isItemEqualToValue={(a, b) => a?.value === b?.value}
      disabled={disabled}
    >
      <ComboboxInput
        id={id}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
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
          <ComboboxEmpty>No members found.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}