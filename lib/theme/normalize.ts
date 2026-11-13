import type {
  LocalizedValue,
  PublishedTheme,
  StorefrontPage,
  ThemeBlock,
  ThemeSection,
  ThemeSetting,
  ThemeSettings,
} from './types'

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function unwrapEnvelope(payload: unknown): unknown {
  if (!isRecord(payload)) return payload
  return 'data' in payload ? payload.data : payload
}

/**
 * The API returns section/block settings either as an object or as a
 * `[{ key, value }]` list (older endpoint shapes). Both are normalised here so
 * the renderer always reads a plain object.
 */
export function normalizeSettings(input: unknown): Record<string, ThemeSetting> {
  if (Array.isArray(input)) {
    const result: Record<string, ThemeSetting> = {}
    for (const entry of input) {
      if (!isRecord(entry) || typeof entry.key !== 'string') continue
      const value = 'value' in entry ? entry.value : entry.default
      result[entry.key] = (value ?? null) as ThemeSetting
    }
    return result
  }
  if (isRecord(input)) return input as Record<string, ThemeSetting>
  return {}
}

function normalizeBlocks(input: unknown): ThemeBlock[] {
  if (!Array.isArray(input)) return []
  return input.flatMap((entry, index) => {
    if (!isRecord(entry)) return []
    const type = typeof entry.type === 'string' ? entry.type : typeof entry.handle === 'string' ? entry.handle : ''
    if (!type) return []
    const ulid = typeof entry.ulid === 'string' ? entry.ulid : undefined
    return [{
      ulid,
      id: typeof entry.id === 'string' ? entry.id : ulid ?? `block-${index}`,
      type,
      settings: normalizeSettings(entry.settings),
      hidden: entry.hidden === true,
    }]
  })
}

function normalizeSections(input: unknown): ThemeSection[] {
  if (!Array.isArray(input)) return []
  return input.flatMap((entry, index) => {
    if (!isRecord(entry)) return []
    const type = typeof entry.type === 'string' ? entry.type : typeof entry.handle === 'string' ? entry.handle : ''
    if (!type) return []
    const ulid = typeof entry.ulid === 'string' ? entry.ulid : undefined
    return [{
      ulid,
      id: typeof entry.id === 'string' ? entry.id : ulid ?? `section-${index}`,
      type,
      settings: normalizeSettings(entry.settings),
      blocks: normalizeBlocks(entry.blocks),
      hidden: entry.hidden === true,
      orphaned: entry.orphaned === true,
    }]
  })
}

/**
 * Published pages use the same envelope as the editor draft:
 * `{ data: { page, sections } }`. Older/alternate responses nest the page
 * under `data.page` with its sections, or return the page directly.
 */
export function normalizePage(payload: unknown): StorefrontPage | null {
  const data = unwrapEnvelope(payload)
  if (!isRecord(data)) return null

  const pageSource = isRecord(data.page) ? data.page : data
  const sectionsSource =
    data.sections
    ?? pageSource.sections
    ?? (isRecord(data.theme) ? data.theme.sections : undefined)
    ?? []

  const type = typeof pageSource.type === 'string' ? pageSource.type : ''
  if (!type && !Array.isArray(sectionsSource)) return null

  const ulid = typeof pageSource.ulid === 'string' ? pageSource.ulid : undefined
  const name = pageSource.name as string | LocalizedValue | undefined

  return {
    ulid,
    id: ulid ?? (typeof pageSource.id === 'string' ? pageSource.id : type || 'page'),
    type: type || 'home',
    slug: typeof pageSource.slug === 'string' ? pageSource.slug : null,
    name,
    sections: normalizeSections(sectionsSource),
  }
}

/** `GET /storefront/theme` returns `{ theme, settings }` (possibly nested in `data`). */
export function normalizeTheme(payload: unknown): PublishedTheme {
  const data = unwrapEnvelope(payload)
  if (!isRecord(data)) return { settings: {} }

  const themeSource = isRecord(data.theme) ? data.theme : isRecord(data) && typeof data.handle === 'string' ? data : null
  const settingsSource = data.settings ?? (themeSource ? themeSource.settings : undefined)

  return {
    theme: themeSource
      ? {
          ulid: typeof themeSource.ulid === 'string' ? themeSource.ulid : undefined,
          handle: typeof themeSource.handle === 'string' ? themeSource.handle : undefined,
          version: typeof themeSource.version === 'string' ? themeSource.version : null,
          name: typeof themeSource.name === 'string' ? themeSource.name : undefined,
        }
      : null,
    settings: normalizeSettings(settingsSource) as ThemeSettings,
    has_unpublished_changes: data.has_unpublished_changes === true,
    published_at: typeof data.published_at === 'string' ? data.published_at : null,
  }
}
