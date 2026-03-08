"use client";

import { useState, useEffect, useRef } from "react";
import type { Template, View, SortMode } from "@/lib/types";
import { generateId, loadTemplates, saveTemplates } from "@/lib/templates";
import { styles } from "@/lib/styles";
import { IconPlus, IconBack, IconDownload, IconUpload } from "./icons";
import { TemplateList } from "./template-list";
import { TemplateEditor } from "./template-editor";
import { TemplateUse } from "./template-use";

export default function Promptly() {
  const [templates, setTemplates] = useState<Template[]>(() => {
    return loadTemplates() ?? [];
  });
  const [view, setView] = useState<View>("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortMode>("name");
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const activeTemplate = templates.find((t) => t.id === activeId) ?? null;

  const openEditor = (id: string | null) => {
    setActiveId(id);
    setView("editor");
  };

  const openUse = (id: string) => {
    setActiveId(id);
    setView("use");
  };

  const handleSaveTemplate = (template: Template) => {
    setTemplates((prev) => {
      const exists = prev.some((t) => t.id === template.id);
      if (exists)
        return prev.map((t) => (t.id === template.id ? template : t));
      return [...prev, template];
    });
    setView("list");
    showToast("Template saved");
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (activeId === id) {
      setView("list");
      setActiveId(null);
    }
    showToast("Template deleted");
  };

  const duplicateTemplate = (id: string) => {
    const src = templates.find((t) => t.id === id);
    if (!src) return;
    setTemplates((prev) => [
      ...prev,
      {
        ...src,
        id: generateId(),
        name: src.name + " (copy)",
        createdAt: Date.now(),
        lastUsedAt: null,
        useCount: 0,
        variables: src.variables.map((v) => ({ ...v })),
      },
    ]);
    showToast("Template duplicated");
  };

  const markUsed = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, lastUsedAt: Date.now(), useCount: t.useCount + 1 }
          : t,
      ),
    );
  };

  const exportAll = () => {
    const blob = new Blob([JSON.stringify(templates, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "promptly-templates.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported");
  };

  const importAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          setTemplates(data);
          showToast(`Imported ${data.length} templates`);
        }
      } catch {
        showToast("Invalid file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={styles.root}>
      {toast && <div style={styles.toast}>{toast}</div>}

      <header style={styles.header}>
        <div style={styles.headerInner}>
          {view !== "list" && (
            <button
              style={styles.backBtn}
              onClick={() => setView("list")}
              title="Back to list"
            >
              <IconBack />
            </button>
          )}
          <div style={styles.logoWrap}>
            <span style={styles.logoMark}>P</span>
            <h1 style={styles.logoText}>Promptly</h1>
          </div>
          {view === "list" && (
            <div style={styles.headerActions}>
              <button
                style={styles.iconBtn}
                onClick={exportAll}
                title="Export all"
              >
                <IconDownload />
              </button>
              <button
                style={styles.iconBtn}
                onClick={() => fileInputRef.current?.click()}
                title="Import"
              >
                <IconUpload />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importAll}
                style={{ display: "none" }}
              />
              <button
                style={styles.primaryBtn}
                onClick={() => openEditor(null)}
              >
                <IconPlus /> <span>New Template</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {view === "list" && (
          <TemplateList
            templates={templates}
            search={search}
            setSearch={setSearch}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onUse={openUse}
            onEdit={openEditor}
            onDelete={deleteTemplate}
            onDuplicate={duplicateTemplate}
            onCreate={() => openEditor(null)}
          />
        )}
        {view === "editor" && (
          <TemplateEditor
            template={activeTemplate}
            onSave={handleSaveTemplate}
            onCancel={() => setView("list")}
          />
        )}
        {view === "use" && activeTemplate && (
          <TemplateUse
            template={activeTemplate}
            onCopy={() => {
              markUsed(activeTemplate.id);
              showToast("Copied to clipboard");
            }}
            onEdit={() => openEditor(activeTemplate.id)}
          />
        )}
      </main>
    </div>
  );
}
