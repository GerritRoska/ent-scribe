"use client";

import { useState } from "react";
import { saveTemplate, Template } from "@/lib/templates";

interface TemplateFormProps {
  onSaved: (template: Template) => void;
}

export default function TemplateForm({ onSaved }: TemplateFormProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !content.trim()) return;
    setSaving(true);
    const saved = saveTemplate({ name: name.trim(), content: content.trim() });
    onSaved(saved);
    setName("");
    setContent("");
    setSaving(false);
  };

  const isValid = name.trim().length > 0 && content.trim().length > 0;

  return (
    <div className="flex flex-col gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
        <h3 className="font-semibold text-slate-800 text-sm">New Template</h3>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Template Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Laryngoscopy, Thyroid Consult..."
          className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
          Template Content{" "}
          <span className="text-slate-400 font-normal normal-case">(paste your eClinicalWorks template)</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full font-mono text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 resize-y"
          placeholder="Paste your template here. The AI will fill in each field using only what was said during the visit."
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!isValid || saving}
        className={`
          flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold
          transition-all duration-200 active:scale-[0.98]
          ${isValid && !saving
            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }
        `}
      >
        {saving ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Saving...
          </>
        ) : (
          "Save Template"
        )}
      </button>
    </div>
  );
}
