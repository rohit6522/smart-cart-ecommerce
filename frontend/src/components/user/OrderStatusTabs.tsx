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
    <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`relative pb-3 text-sm font-medium transition ${
            active === tab.key ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {tab.label}
          {counts[tab.key] > 0 && (
            <span className="ml-1.5 text-xs text-gray-400">({counts[tab.key]})</span>
          )}
          {active === tab.key && (
            <span className="absolute left-0 -bottom-px w-full h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}