"use client";

import { useState, useRef } from "react";
import { getTemplates, deleteTemplate, updateTemplate, saveTemplate, Template } from "@/lib/templates";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(() => getTemplates());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [newName, setNewName] = useState("");
  const [newContent, setNewContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reload = () => setTemplates(getTemplates());

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    reload();
  };

  const startEdit = (t: Template) => {
    if (t.isDefault) {
      const saved = saveTemplate({ name: `${t.name} (custom)`, content: t.content });
      reload();
      setEditingId(saved.id);
      setEditName(saved.name);
      setEditContent(saved.content);
    } else {
      setEditingId(t.id);
      setEditName(t.name);
      setEditContent(t.content);
    }
    setExpandedId(null);
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateTemplate(editingId, { name: editName.trim(), content: editContent.trim() });
    setEditingId(null);
    reload();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewContent(ev.target?.result as string ?? "");
      if (!newName) setNewName(file.name.replace(/\.[^.]+$/, ""));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleSaveNew = () => {
    if (!newName.trim() || !newContent.trim()) return;
    saveTemplate({ name: newName.trim(), content: newContent.trim() });
    setNewName("");
    setNewContent("");
    reload();
  };

  const isNewValid = newName.trim().length > 0 && newContent.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-8 py-8 flex flex-col gap-8 min-h-screen">
      <h1 className="text-xl font-bold text-gray-900">Templates</h1>

      {/* Add new template */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#374151"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">New Template</h3>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Template Name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Laryngoscopy, Thyroid Consult..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Template Content{" "}
              <span className="text-gray-400 font-normal normal-case">(paste or upload .txt)</span>
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Upload .txt
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileUpload}
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={10}
            className="w-full font-mono text-sm border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
            placeholder="Paste your template here, or click 'Upload .txt' above."
          />
        </div>

        <button
          onClick={handleSaveNew}
          disabled={!isNewValid}
          className={`
            py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]
            ${isNewValid
              ? "bg-gray-900 hover:bg-black text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Save Template
        </button>
      </div>

      {/* Template list */}
      <div className="flex flex-col gap-2">
        {templates.map((t) => (
          <div key={t.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {editingId === t.id ? (
              <div className="p-4 flex flex-col gap-3">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 font-medium bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={12}
                  className="font-mono text-sm text-gray-900 border border-gray-200 rounded-xl px-4 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 resize-y"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="bg-gray-900 text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-black transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-600 text-sm px-4 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      t.isDefault ? "bg-gray-300" : "bg-gray-700"
                    }`} />
                    <span className="font-medium text-gray-800 text-sm">{t.name}</span>
                    {t.isDefault && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                        Built-in
                      </span>
                    )}
                    {!t.isDefault && (
                      <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full font-medium">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(t); }}
                      className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors px-2 py-1 hover:bg-gray-100 rounded-lg"
                    >
                      {t.isDefault ? "Duplicate & Edit" : "Edit"}
                    </button>
                    {!t.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${t.name}"?`)) handleDelete(t.id);
                        }}
                        className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors px-2 py-1 hover:bg-red-50 rounded-lg"
                      >
                        Delete
                      </button>
                    )}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`text-gray-400 transition-transform duration-200 ${
                        expandedId === t.id ? "rotate-180" : ""
                      }`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>
                {expandedId === t.id && (
                  <div className="border-t border-gray-100 bg-gray-50">
                    <pre className="text-xs font-mono text-gray-700 p-4 whitespace-pre-wrap overflow-auto max-h-64 leading-relaxed">
                      {t.content}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
