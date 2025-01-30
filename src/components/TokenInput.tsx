import React from "react";
import Select, { ActionMeta, MultiValue } from "react-select";

export type Option = { value: string; label: string };

type TokenInputProps = {
  options: Option[];
  onChange?: (
    newValue: MultiValue<Option>,
    actionMeta: ActionMeta<Option>
  ) => void;
  value?: Option[];
  placeholder?: string;
  className?: string;
};

export default function TokenInput(props: TokenInputProps) {
  const classNames = {
    control: () =>
      "w-full border shadow-sm font-medium text-neutral-600 dark:text-neutral-300 dark:bg-black dark:placeholder:text-neutral-600 border-neutral-300 dark:border-neutral-800 bg-transparent rounded-md p-3 text-sm",
    menu: () =>
      "my-2 border border-gray-300 rounded-md shadow-lg bg-neutral-50 dark:bg-black dark:border-neutral-800",
    menuList: () => "flex flex-col py-2 overflow-hidden",
    option: () =>
      "!cursor-pointer text-sm text-neutral-900 dark:text-neutral-100 px-4 py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-900 cursor-pointer",
    valueContainer: () => "flex flex-wrap gap-1.5",
    inputContainer: () => "cursor-text",
    multiValue: () =>
      "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 rounded-md flex items-center gap-1 py-1 px-1.5",
    multiValueLabel: () => "text-sm pl-0.5",
    multiValueRemove: () =>
      "cursor-pointer size-4 rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-700 flex items-center justify-center",
    dropdownIndicator: () => "!hidden",
    noOptionsMessage: () => "text-sm text-neutral-500 dark:text-neutral-400",
  };

  return (
    <Select
      classNamePrefix="react-select"
      classNames={classNames}
      options={props.options}
      value={props.value}
      unstyled
      isMulti
      required
      isClearable={false}
      closeMenuOnSelect={false}
      escapeClearsValue={false}
      placeholder={props.placeholder || "Select Fields"}
      noOptionsMessage={() => "No fields"}
      components={{
        DropdownIndicator: () => null,
      }}
      onChange={props.onChange}
      className={`w-full ${props.className}`}
    />
  );
}
