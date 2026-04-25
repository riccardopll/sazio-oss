type ClassValue = string | false | null | undefined;

export function cn(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(" ");
}

export const screenStyles = {
  content: "px-5",
  header: "px-5 pb-2 pt-4",
  embeddedHeader: "pb-2 pt-4",
  scrollContent: "px-5",
  cardGap: "gap-3",
} as const;

export const textStyles = {
  eyebrow: "text-xs uppercase tracking-[1.6px] text-text-muted",
  screenTitle: "text-4xl font-bold text-text-primary",
  screenTitleWithEyebrow: "mt-2 text-4xl font-bold text-text-primary",
  sectionTitle:
    "text-sm font-medium uppercase tracking-[1.1px] text-text-muted",
  cardTitle: "text-lg font-semibold text-text-primary",
  cardSubtitle: "text-base font-medium leading-5 text-text-secondary",
  cardFooter: "text-xs text-text-muted",
  body: "text-base text-text-secondary",
  caption: "text-sm text-text-muted",
} as const;

export const cardStyles = {
  base: "overflow-hidden rounded-[20px] border border-border-subtle bg-surface-card shadow-lg shadow-black/40",
  content: "p-5",
  row: "flex-row items-center gap-4 px-4 py-4",
} as const;

export const controlStyles = {
  hitTarget: "min-h-11 min-w-11 items-center justify-center",
  textAction: "min-h-11 justify-center",
} as const;
