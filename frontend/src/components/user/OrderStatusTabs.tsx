"use client";

type TabKey = "ALL" | "PROCESSING" | "SHIPPED" | "DELIVERED";

interface OrderStatusTabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  counts: Record<TabKey, number>;
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "ALL", label: "All Orders" },
  { key: "PROCESSING", label: "Processing" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

export default function OrderStatusTabs({ active, onChange, counts }: OrderStatusTabsProps) {
  return (
    <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200/80 mb-6 sm:mb-8 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative pb-3.5 text-sm whitespace-nowrap transition-colors inline-flex items-center ${
            active === tab.key ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-900 font-semibold"
          }`}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span className={`ml-2 text-2xs font-bold px-2 py-0.5 rounded-full transition-colors ${
              active === tab.key ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-slate-100 text-slate-500"
            }`}>
              {counts[tab.key]}
            </span>
          )}
          {active === tab.key && (
            <span className="absolute left-0 -bottom-px w-full h-0.5 bg-blue-600 rounded-full shadow-2xs" />
          )}
        </button>
      ))}
    </div>
  );
}