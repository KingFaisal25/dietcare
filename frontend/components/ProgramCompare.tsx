"use client";

import { useState } from "react";
import { Check, GitCompareArrows, Minus, X } from "lucide-react";

interface CompareRow {
  label: string;
  simple: string | boolean;
  intensif: string | boolean;
}

interface ProgramCompareProps {
  rows: CompareRow[];
}

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="mx-auto h-5 w-5 text-emerald-500" />
    ) : (
      <Minus className="mx-auto h-5 w-5 text-gray-300" />
    );
  }
  return <span className="text-sm font-medium text-gray-700">{value}</span>;
}

export default function ProgramCompare({ rows }: ProgramCompareProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-2xl border-2 border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-emerald-500 hover:text-emerald-600"
      >
        <GitCompareArrows className="h-4 w-4" />
        Bandingkan Program
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <h3 className="text-xl font-bold text-gray-900">Bandingkan Program</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(85vh-80px)] p-6">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="pb-4 text-left text-sm font-semibold text-gray-500">Fitur</th>
                    <th className="pb-4 text-center text-sm font-bold text-gray-700">
                      <span className="rounded-full bg-gray-100 px-4 py-1.5">Simple</span>
                    </th>
                    <th className="pb-4 text-center text-sm font-bold text-emerald-700">
                      <span className="rounded-full bg-emerald-50 px-4 py-1.5">Intensif</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-4 pr-4 text-sm font-medium text-gray-600">{row.label}</td>
                      <td className="py-4 text-center">
                        <CellValue value={row.simple} />
                      </td>
                      <td className="py-4 text-center">
                        <CellValue value={row.intensif} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
