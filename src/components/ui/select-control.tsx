"use client";

import { Check, ChevronDown } from "lucide-react";
import { Select } from "@base-ui/react/select";

export function SelectControl({ value, onChange, options, label }: { value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; label: string }) {
  return <Select.Root value={value} onValueChange={(next) => { if (next) onChange(next); }}>
    <Select.Trigger className="select-trigger" aria-label={label}><Select.Value /><Select.Icon><ChevronDown size={15} /></Select.Icon></Select.Trigger>
    <Select.Portal><Select.Positioner className="select-positioner" sideOffset={6}><Select.Popup className="select-popup"><Select.List>{options.map((option) => <Select.Item key={option.value} value={option.value} className="select-item"><Select.ItemText>{option.label}</Select.ItemText><Select.ItemIndicator><Check size={14}/></Select.ItemIndicator></Select.Item>)}</Select.List></Select.Popup></Select.Positioner></Select.Portal>
  </Select.Root>;
}
