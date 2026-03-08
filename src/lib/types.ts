export interface Variable {
  name: string;
  hint: string;
  defaultValue: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  body: string;
  variables: Variable[];
  createdAt: number;
  lastUsedAt: number | null;
  useCount: number;
}

export type View = "list" | "editor" | "use";
export type SortMode = "name" | "recent" | "used";
