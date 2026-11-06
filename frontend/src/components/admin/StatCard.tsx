import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "green" | "purple" | "yellow";
}

const colorStyles = {
  blue: "bg-blue-50 text-blue-600 border border-blue-100",
  green: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  purple: "bg-indigo-50 text-indigo-600 border border-indigo-100",
  yellow: "bg-amber-50 text-amber-600 border border-amber-100",
};

export default function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl shadow-xs hover:shadow-md border border-slate-200/80 p-5 sm:p-6 flex items-center gap-4 transition-all duration-200">
      <div className={`p-3.5 rounded-2xl ${colorStyles[color]} shadow-2xs`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}