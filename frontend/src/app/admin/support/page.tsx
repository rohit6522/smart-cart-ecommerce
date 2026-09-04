"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { getAllTickets, resolveTicket } from "@/lib/supportApi";
import { SupportTicket } from "@/types";
import { ArrowLeft, CheckCircle2, Clock, Mail } from "lucide-react";

function AdminSupportContent() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTickets = () => {
    getAllTickets()
      .then(setTickets)
      .catch((err) => console.error("Failed to load tickets", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (id: number) => {
    try {
      await resolveTicket(id);
      fetchTickets();
    } catch (err) {
      console.error("Failed to resolve ticket", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="Admin Panel" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        <button
          onClick={() => router.push("/admin")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

       <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Support Tickets</h1>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 skeleton-shimmer rounded-xl" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No support tickets yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                  <span
                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${
                      ticket.status === "RESOLVED"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {ticket.status === "RESOLVED" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {ticket.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{ticket.message}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Mail size={12} /> {ticket.userName} ({ticket.userEmail})
                </div>
                {ticket.status === "OPEN" && (
                  <button
                    onClick={() => handleResolve(ticket.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg"
                  >
                    Mark as Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AdminSupportContent />
    </ProtectedRoute>
  );
}