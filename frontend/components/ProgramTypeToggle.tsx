"use client";

interface ProgramTypeToggleProps {
  activeType: "simple" | "intensif";
  onChange: (type: "simple" | "intensif") => void;
}

export default function ProgramTypeToggle({ activeType, onChange }: ProgramTypeToggleProps) {
  return (
    <div className="inline-flex items-center rounded-2xl bg-gray-100 p-1.5">
      <button
        type="button"
        onClick={() => onChange("simple")}
        className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
          activeType === "simple"
            ? "bg-white text-gray-900 shadow-md"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Simple
      </button>
      <button
        type="button"
        onClick={() => onChange("intensif")}
        className={`rounded-xl px-6 py-2.5 text-sm font-semibold transition-all ${
          activeType === "intensif"
            ? "bg-emerald-600 text-white shadow-md"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Intensif
      </button>
    </div>
  );
}
