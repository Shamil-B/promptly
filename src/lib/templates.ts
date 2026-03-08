import type { Template } from "./types";

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function extractVariables(body: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const match of body.matchAll(/\{\{(\w+)\}\}/g)) {
    const name = match[1];
    if (!seen.has(name)) {
      seen.add(name);
      result.push(name);
    }
  }
  return result;
}

const LONG_FORM_KEYWORDS = ["description", "code", "content", "body"];

export function shouldUseTextarea(varName: string, hint: string): boolean {
  if (hint.toLowerCase().includes("paste")) return true;
  const lower = varName.toLowerCase();
  return LONG_FORM_KEYWORDS.some((kw) => lower.includes(kw));
}

const STORAGE_KEY = "Promptly_templates";

export function loadTemplates(): Template[] | null {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // localStorage unavailable or corrupt data
  }
  return null;
}

export function saveTemplates(templates: Template[]): void {
  try {
    window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // localStorage unavailable or quota exceeded
  }
}
