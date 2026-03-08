"use client";

import { useMemo } from "react";
import type { Template, SortMode } from "@/lib/types";
import { extractVariables } from "@/lib/templates";
import { styles } from "@/lib/styles";
import {
  IconSearch,
  IconPlus,
  IconPlay,
  IconEdit,
  IconDuplicate,
  IconTrash,
} from "./icons";

const SORT_LABELS: Record<SortMode, string> = {
  name: "A-Z",
  recent: "Recent",
  used: "Most Used",
};

interface TemplateListProps {
  templates: Template[];
  search: string;
  setSearch: (value: string) => void;
  sortBy: SortMode;
  setSortBy: (value: SortMode) => void;
  onUse: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCreate: () => void;
}

export function TemplateList({
  templates,
  search,
  setSearch,
  sortBy,
  setSortBy,
  onUse,
  onEdit,
  onDelete,
  onDuplicate,
  onCreate,
}: TemplateListProps) {
  const filtered = useMemo(() => {
    let list = templates;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => {
      if (sortBy === "recent")
        return (b.lastUsedAt ?? 0) - (a.lastUsedAt ?? 0);
      if (sortBy === "used") return b.useCount - a.useCount;
      return a.name.localeCompare(b.name);
    });
  }, [templates, search, sortBy]);

  return (
    <div>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={styles.searchWrap}>
          <span style={styles.searchIcon}>
            <IconSearch />
          </span>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={styles.sortWrap}>
          {(["name", "recent", "used"] as const).map((s) => (
            <button
              key={s}
              style={{
                ...styles.sortBtn,
                ...(sortBy === s ? styles.sortBtnActive : {}),
              }}
              onClick={() => setSortBy(s)}
            >
              {SORT_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={styles.empty}>
          {templates.length === 0 ? (
            <>
              <p style={styles.emptyTitle}>No templates yet</p>
              <button style={styles.primaryBtn} onClick={onCreate}>
                <IconPlus /> <span>Create your first template</span>
              </button>
            </>
          ) : (
            <p style={styles.emptyTitle}>
              No matches for &quot;{search}&quot;
            </p>
          )}
        </div>
      )}

      {/* Card grid */}
      <div style={styles.cardGrid}>
        {filtered.map((t) => {
          const vars = extractVariables(t.body);
          return (
            <div key={t.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>{t.name}</h3>
                <div style={styles.cardMeta}>
                  <span style={styles.varBadge}>
                    {vars.length} var{vars.length !== 1 ? "s" : ""}
                  </span>
                  {t.useCount > 0 && (
                    <span style={styles.useBadge}>used {t.useCount}x</span>
                  )}
                </div>
              </div>
              {t.description && (
                <p style={styles.cardDesc}>{t.description}</p>
              )}
              <div style={styles.varList}>
                {vars.slice(0, 4).map((v) => (
                  <span key={v} style={styles.varTag}>
                    {"{{" + v + "}}"}
                  </span>
                ))}
                {vars.length > 4 && (
                  <span style={styles.varTag}>+{vars.length - 4}</span>
                )}
              </div>
              <div style={styles.cardActions}>
                <button style={styles.useBtn} onClick={() => onUse(t.id)}>
                  <IconPlay /> Use
                </button>
                <button
                  style={styles.smallBtn}
                  onClick={() => onEdit(t.id)}
                  title="Edit"
                >
                  <IconEdit />
                </button>
                <button
                  style={styles.smallBtn}
                  onClick={() => onDuplicate(t.id)}
                  title="Duplicate"
                >
                  <IconDuplicate />
                </button>
                <button
                  style={{ ...styles.smallBtn, ...styles.dangerBtn }}
                  onClick={() => onDelete(t.id)}
                  title="Delete"
                >
                  <IconTrash />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
