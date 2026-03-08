"use client";

import { useState, useMemo } from "react";
import type { Template } from "@/lib/types";
import { generateId, extractVariables } from "@/lib/templates";
import { styles } from "@/lib/styles";

interface TemplateEditorProps {
  template: Template | null;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

export function TemplateEditor({
  template,
  onSave,
  onCancel,
}: TemplateEditorProps) {
  const isNew = !template;
  const [name, setName] = useState(template?.name ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [varHints, setVarHints] = useState<
    Record<string, { hint: string; defaultValue: string }>
  >(() => {
    const map: Record<string, { hint: string; defaultValue: string }> = {};
    for (const v of template?.variables ?? []) {
      map[v.name] = { hint: v.hint || "", defaultValue: v.defaultValue || "" };
    }
    return map;
  });

  const detectedVars = useMemo(() => extractVariables(body), [body]);

  const updateHint = (
    varName: string,
    field: "hint" | "defaultValue",
    val: string,
  ) => {
    setVarHints((prev) => ({
      ...prev,
      [varName]: { ...prev[varName], [field]: val },
    }));
  };

  const canSave = name.trim() !== "" && body.trim() !== "";

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: template?.id ?? generateId(),
      name: name.trim(),
      description: description.trim(),
      body,
      variables: detectedVars.map((v) => ({
        name: v,
        hint: varHints[v]?.hint ?? "",
        defaultValue: varHints[v]?.defaultValue ?? "",
      })),
      createdAt: template?.createdAt ?? Date.now(),
      lastUsedAt: template?.lastUsedAt ?? null,
      useCount: template?.useCount ?? 0,
    });
  };

  return (
    <div>
      <div style={styles.editorTop}>
        <h2 style={styles.viewTitle}>
          {isNew ? "New Template" : "Edit Template"}
        </h2>
      </div>

      <div style={styles.editorLayout}>
        {/* Main fields */}
        <div style={styles.editorMain}>
          <label style={styles.label}>Name</label>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Code Review"
          />

          <label style={{ ...styles.label, marginTop: 16 }}>
            Description <span style={styles.optional}>(optional)</span>
          </label>
          <input
            style={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description of what this prompt does"
          />

          <label style={{ ...styles.label, marginTop: 16 }}>
            Prompt Body
            <span style={styles.hint}>
              Use {"{{variable_name}}"} for placeholders
            </span>
          </label>
          <textarea
            style={styles.textarea}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              "Write your prompt template here...\n\nExample:\nReview this {{language}} code:\n```\n{{code}}\n```"
            }
            rows={14}
          />
        </div>

        {/* Sidebar: detected variables */}
        <div style={styles.editorSidebar}>
          <h3 style={styles.sidebarTitle}>
            Detected Variables
            <span style={styles.varCount}>{detectedVars.length}</span>
          </h3>
          {detectedVars.length === 0 && (
            <p style={styles.sidebarEmpty}>
              Add {"{{variable}}"} placeholders in your prompt body to define
              fill-in fields.
            </p>
          )}
          <div style={styles.varEditor}>
            {detectedVars.map((v) => (
              <div key={v} style={styles.varEditorItem}>
                <code style={styles.varCode}>{"{{" + v + "}}"}</code>
                <input
                  style={styles.varInput}
                  placeholder="Hint / label"
                  value={varHints[v]?.hint ?? ""}
                  onChange={(e) => updateHint(v, "hint", e.target.value)}
                />
                <input
                  style={styles.varInput}
                  placeholder="Default value"
                  value={varHints[v]?.defaultValue ?? ""}
                  onChange={(e) =>
                    updateHint(v, "defaultValue", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={styles.editorActions}>
        <button style={styles.ghostBtn} onClick={onCancel}>
          Cancel
        </button>
        <button
          style={{ ...styles.primaryBtn, opacity: canSave ? 1 : 0.4 }}
          onClick={handleSave}
          disabled={!canSave}
        >
          {isNew ? "Create Template" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
