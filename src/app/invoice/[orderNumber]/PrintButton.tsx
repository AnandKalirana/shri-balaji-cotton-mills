"use client";
export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="print:hidden h-11 px-5 bg-ink text-white text-sm font-medium">
      Print or save as PDF
    </button>
  );
}
