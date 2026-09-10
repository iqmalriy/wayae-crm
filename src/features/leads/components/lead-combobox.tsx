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
import { useListLeads } from "../queries/list-lead";
import { useGetLead } from "../queries/get-lead";

interface LeadOption {
  value: string;
  label: string;
  leadNumber: string;
  company: string | null;
}

interface LeadComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  ariaInvalid?: boolean;
  showClear?: boolean;
}

export function LeadCombobox({
  value,
  onValueChange,
  disabled,
  placeholder = "Select a lead...",
  id,
  ariaInvalid,
  showClear,
}: LeadComboboxProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedSearch = useDebounce(inputValue.trim(), 300);

  const { data } = useListLeads({
    page: 1,
    perPage: 50,
    search: debouncedSearch || undefined,
    mine: true,
    excludeClosed: true,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const options: LeadOption[] = (data?.leads ?? []).map((lead) => ({
    value: lead.id,
    label: lead.costumer.name ?? "Untitled lead",
    leadNumber: lead.leadNumber,
    company: lead.organization.name,
  }));

  const found = options.find((option) => option.value === value) ?? null;

  // When the selected lead isn't in the current (debounced search) results,
  // fetch its detail so the input keeps showing its label.
  const { data: detail } = useGetLead(value, {
    enabled: Boolean(value) && !found,
  });

  const selected: LeadOption | null =
    found ??
    (detail?.lead
      ? {
          value: detail.lead.id,
          label: detail.lead.costumer.name ?? "Untitled lead",
          leadNumber: detail.lead.leadNumber,
          company: detail.lead.organization.name,
        }
      : null);

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
                <span className="flex-1">
                  <span className="block">{item.label}</span>
                  {item.company ? (
                    <span className="block text-xs text-muted-foreground">
                      {item.company}
                    </span>
                  ) : null}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {item.leadNumber}
                </span>
              </ComboboxItem>
            )}
          </ComboboxCollection>
          <ComboboxEmpty>No leads found.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}