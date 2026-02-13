import Select, { StylesConfig, GroupBase, SingleValue } from "react-select";

import { Namespace } from "@/types";



interface NamespaceSelectorProps {
  namespaces: Namespace[];
  isLoading: boolean;
  onSelect: (value: string | null) => void;
  currentSelected: string | null;
}

const customStyles: StylesConfig<Namespace, false, GroupBase<Namespace>> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(23, 23, 23, 0.5)", // neutral-900/50
    borderColor: state.isFocused ? "#6366f1" : "rgba(38, 38, 38, 1)", // neutral-800
    color: "#e5e5e5", // neutral-200
    borderRadius: "0.75rem", // rounded-xl
    padding: "2px",
    fontSize: "0.875rem",
    boxShadow: "none",
    "&:hover": { borderColor: "rgba(64, 64, 64, 1)" }, // neutral-700
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#171717", // neutral-900
    border: "1px solid #262626", // neutral-800
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#4f46e5" : state.isFocused ? "#262626" : "transparent",
    color: state.isSelected ? "#ffffff" : "#d4d4d4",
    cursor: "pointer",
    fontSize: "0.875rem",
    "&:active": { backgroundColor: "#4338ca" },
  }),
  singleValue: (base) => ({
    ...base,
    color: "#e5e5e5",
  }),
  input: (base) => ({
    ...base,
    color: "#e5e5e5",
  }),
  placeholder: (base) => ({
    ...base,
    color: "#737373", // neutral-500
  }),
};

export default function NamespaceSelector({ namespaces, isLoading, onSelect, currentSelected}: NamespaceSelectorProps) {
  return (
    <div className="w-full relative">
      <Select
        options={namespaces}
        isSearchable
        styles={customStyles}
        placeholder="Select documentation..."
        isLoading={isLoading}
        onChange={(e) => onSelect((e as SingleValue<Namespace>)?.value || null)}
        value={namespaces.find((ns) => ns.value === currentSelected)}
        className="react-select-container"
        classNamePrefix="react-select"
      />
    </div>
  );
}
