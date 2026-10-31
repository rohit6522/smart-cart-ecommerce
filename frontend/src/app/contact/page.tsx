"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      if (res.ok) {
        setSent(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setError(data.error || "Failed to submit message");
      }
    } catch {
      setError("Network error while submitting");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            Customer Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            We&rsquo;re Here to Help.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Have a question about an order, return, product specification, or wholesale inquiry? Get in touch with our team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details (5 cols) */}
          <div className="lg:col-span-5 bg-slate-950 text-white rounded-3xl p-8 space-y-6">
            <h3 className="text-lg font-bold">Contact Information</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our dedicated executive desk is available Monday through Saturday from 9:00 AM to 8:00 PM IST.
            </p>

            <div className="space-y-4 text-xs pt-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Headquarters</h4>
                  <p className="text-slate-400 mt-0.5">
                    Cyber Towers, Hitech City, Hyderabad, TG 500081, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Telephone Assistance</h4>
                  <p className="text-slate-400 mt-0.5">+91 1800-CARTNOVA / +91 9876543210</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-orange-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-white">Email Desk</h4>
                  <p className="text-slate-400 mt-0.5">support@cartnova.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xs space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Send Us a Direct Message</h3>

            {sent && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Thank you! Your message has been received. Our concierge team will reply within 24 hours.
                </span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Order Tracking #TN-1024 or Product Inquiry"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we assist you today?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-600/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Sending..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
