"use client";

import { useState, useMemo } from "react";
import type { Template } from "@/lib/types";
import { extractVariables, shouldUseTextarea } from "@/lib/templates";
import { styles } from "@/lib/styles";
import { IconEdit, IconCopy, IconCheck } from "./icons";

interface TemplateUseProps {
  template: Template;
  onCopy: () => void;
  onEdit: () => void;
}

export function TemplateUse({ template, onCopy, onEdit }: TemplateUseProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const v of template.variables) {
      map[v.name] = v.defaultValue || "";
    }
    return map;
  });
  const [copied, setCopied] = useState(false);

  const vars = extractVariables(template.body);

  const rendered = useMemo(() => {
    let out = template.body;
    for (const v of vars) {
      const val = values[v];
      if (val) {
        out = out.replaceAll(`{{${v}}}`, val);
      }
    }
    return out;
  }, [template.body, values, vars]);

  const allFilled = vars.every((v) => values[v]?.trim());

  const handleCopy = () => {
    navigator.clipboard.writeText(rendered).then(() => {
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleClear = () => {
    const map: Record<string, string> = {};
    for (const v of template.variables) {
      map[v.name] = v.defaultValue || "";
    }
    setValues(map);
  };

  const updateValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div style={styles.useHeader}>
        <div>
          <h2 style={styles.viewTitle}>{template.name}</h2>
          {template.description && (
            <p style={styles.useDesc}>{template.description}</p>
          )}
        </div>
        <button style={styles.smallBtn} onClick={onEdit} title="Edit template">
          <IconEdit />
        </button>
      </div>

      <div style={styles.useLayout}>
        {/* Variable form */}
        <div style={styles.useForm}>
          <h3 style={styles.formTitle}>Fill Variables</h3>
          {vars.map((v) => {
            const meta = template.variables.find((x) => x.name === v);
            const hintText = meta?.hint ?? "";
            const isLongForm = shouldUseTextarea(v, hintText);
            return (
              <div key={v} style={styles.formField}>
                <label style={styles.formLabel}>
                  <code style={styles.formVarName}>{v}</code>
                  {hintText && <span style={styles.formHint}>{hintText}</span>}
                </label>
                {isLongForm ? (
                  <textarea
                    style={styles.formTextarea}
                    value={values[v] ?? ""}
                    onChange={(e) => updateValue(v, e.target.value)}
                    rows={5}
                    placeholder={hintText || `Enter ${v}`}
                  />
                ) : (
                  <input
                    style={styles.formInput}
                    value={values[v] ?? ""}
                    onChange={(e) => updateValue(v, e.target.value)}
                    placeholder={hintText || `Enter ${v}`}
                  />
                )}
              </div>
            );
          })}
          <div style={styles.formActions}>
            <button style={styles.ghostBtn} onClick={handleClear}>
              Clear All
            </button>
          </div>
        </div>

        {/* Live preview */}
        <div style={styles.usePreview}>
          <div style={styles.previewHeader}>
            <h3 style={styles.formTitle}>Live Preview</h3>
            <button
              style={{
                ...styles.copyBtn,
                ...(copied ? styles.copyBtnDone : {}),
              }}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <IconCheck /> Copied
                </>
              ) : (
                <>
                  <IconCopy /> Copy Prompt
                </>
              )}
            </button>
          </div>
          <pre style={styles.previewBody}>{rendered}</pre>
          {!allFilled && (
            <p style={styles.previewNote}>
              Unfilled variables will appear as {"{{variable}}"} in the output.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
