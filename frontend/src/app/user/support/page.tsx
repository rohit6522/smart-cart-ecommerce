"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { submitTicket, getMyTickets } from "@/lib/supportApi";
import { SupportTicket } from "@/types";
import { MessageCircle, Send, CheckCircle2, Clock } from "lucide-react";

function SupportContent() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = () => {
    getMyTickets()
      .then(setTickets)
      .catch((err) => console.error("Failed to load tickets", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!subject.trim() || !message.trim()) {
      setError("Please fill in both fields");
      return;
    }
    setSubmitting(true);
    try {
      await submitTicket(subject, message);
      setSuccess("Your query has been submitted. We'll get back to you soon.");
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit query");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar title="Smart Cart" />

      <div className="max-w-3xl mx-auto px-6 py-8 flex-1 w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h1>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle size={18} className="text-blue-600" />
            <h2 className="font-bold text-gray-900">Send us a message</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              placeholder="Describe your issue or question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {error && <p className="text-red-600 text-sm">{error}</p>}
            {success && (
              <div className="bg-green-50 text-green-700 text-sm px-4 py-2.5 rounded-lg">{success}</div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg disabled:opacity-50"
            >
              <Send size={15} /> {submitting ? "Sending..." : "Submit Query"}
            </button>
          </form>
        </div>

        {/* Past tickets */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-bold text-gray-900 mb-4">Your Previous Queries</h2>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 skeleton-shimmer rounded-lg" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No queries submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="font-medium text-gray-900 text-sm">{ticket.subject}</h4>
                    <span
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        ticket.status === "RESOLVED"
                          ? "bg-green-50 text-green-700"
                          : "bg-yellow-50 text-yellow-700"
                      }`}
                    >
                      {ticket.status === "RESOLVED" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{ticket.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function SupportPage() {
  return (
    <ProtectedRoute allowedRoles={["USER"]}>
      <SupportContent />
    </ProtectedRoute>
  );
}