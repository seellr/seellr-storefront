import type { StoreLocale, StorefrontPage, ThemeSettings } from '@/lib/theme/types'
export const PREVIEW_SOURCE = 'seller-theme-preview'
export const PREVIEW_PROTOCOL_VERSION = 1
export type EditorToPreviewMessage =
  | { source: typeof PREVIEW_SOURCE; v: typeof PREVIEW_PROTOCOL_VERSION; type: 'INIT'; page: StorefrontPage; themeSettings: ThemeSettings; locale: StoreLocale }
  | { source: typeof PREVIEW_SOURCE; v: typeof PREVIEW_PROTOCOL_VERSION; type: 'UPDATE_PAGE'; page: StorefrontPage }
  | { source: typeof PREVIEW_SOURCE; v: typeof PREVIEW_PROTOCOL_VERSION; type: 'UPDATE_SETTINGS'; themeSettings: ThemeSettings }
  | { source: typeof PREVIEW_SOURCE; v: typeof PREVIEW_PROTOCOL_VERSION; type: 'SELECT_SECTION'; sectionId: string | null }
  | { source: typeof PREVIEW_SOURCE; v: typeof PREVIEW_PROTOCOL_VERSION; type: 'SET_LOCALE'; locale: StoreLocale }
export type PreviewToEditorMessage = { source: typeof PREVIEW_SOURCE; v: typeof PREVIEW_PROTOCOL_VERSION; type: 'READY' | 'SECTION_HOVERED'; sectionId?: string | null } | { source: typeof PREVIEW_SOURCE; v: typeof PREVIEW_PROTOCOL_VERSION; type: 'SECTION_CLICKED'; sectionId: string } | { source: typeof PREVIEW_SOURCE; v: typeof PREVIEW_PROTOCOL_VERSION; type: 'ERROR'; message: string }
export function allowedPreviewOrigins(): string[] { const configured = process.env.NEXT_PUBLIC_PREVIEW_EDITOR_ORIGINS?.split(',').map((item) => item.trim()).filter(Boolean) ?? []; return configured.length ? configured : [window.location.origin] }
export function isPreviewMessage(value: unknown): value is { source: typeof PREVIEW_SOURCE; v: typeof PREVIEW_PROTOCOL_VERSION; type: string } { if (!value || typeof value !== 'object') return false; const candidate = value as { source?: unknown; v?: unknown; type?: unknown }; return candidate.source === PREVIEW_SOURCE && candidate.v === PREVIEW_PROTOCOL_VERSION && typeof candidate.type === 'string' }
