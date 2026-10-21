"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import toast from "react-hot-toast";
import { FormField, inputClass } from "@/components/dashboard/FormField";
import type { Customer } from "@/types";

export default function NewsletterPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [target, setTarget] = useState<"all" | "single" | "custom">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then(setCustomers);
  }, []);

  function toggleSelected(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function send() {
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message are required");
      return;
    }
    if (target !== "all" && selected.length === 0) {
      toast.error("Select at least one customer");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message, target, customerIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Couldn't send newsletter");
        return;
      }
      toast.success(`Sent to ${data.sent} of ${data.total} recipients`);
      setSubject("");
      setMessage("");
      setSelected([]);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-beige mb-8">Newsletter</h1>

      <FormField label="Send To">
        <div className="flex gap-2 font-mono text-[11px] uppercase tracking-wider">
          {(["all", "single", "custom"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTarget(t);
                setSelected([]);
              }}
              className={`px-3 py-2 border ${target === t ? "border-beige text-beige" : "border-line text-beige-dim"}`}
            >
              {t === "all" ? "All Subscribers" : t === "single" ? "Single Customer" : "Custom Selection"}
            </button>
          ))}
        </div>
      </FormField>

      {target !== "all" && (
        <FormField label={target === "single" ? "Select One Customer" : "Select Customers"}>
          <div className="border border-line max-h-56 overflow-y-auto">
            {customers.map((c) => (
              <label key={c._id} className="flex items-center gap-3 px-4 py-2.5 border-b border-line last:border-b-0 text-sm text-beige cursor-pointer">
                <input
                  type={target === "single" ? "radio" : "checkbox"}
                  name="customer"
                  checked={selected.includes(c._id)}
                  onChange={() => (target === "single" ? setSelected([c._id]) : toggleSelected(c._id))}
                />
                {c.name} <span className="font-mono text-[10px] text-beige-dim">({c.email})</span>
              </label>
            ))}
          </div>
        </FormField>
      )}

      <FormField label="Subject">
        <input className={inputClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
      </FormField>

      <FormField label="Message (HTML supported)">
        <textarea className={inputClass} rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
      </FormField>

      <button
        onClick={send}
        disabled={sending}
        className="flex items-center gap-2 bg-burgundy hover:bg-burgundy-hover text-white px-6 py-3 font-mono text-xs uppercase tracking-widest-plus"
      >
        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Send Newsletter
      </button>
    </div>
  );
}
