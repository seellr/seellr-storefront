export type StoreLocale = 'ar' | 'en'

export interface MediaReference {
  ulid?: string
  url?: string | null
  thumb_url?: string | null
}

export interface LocalizedValue {
  ar?: string
  en?: string
}

export type ThemeSetting =
  | string
  | number
  | boolean
  | null
  | MediaReference
  | LocalizedValue
  | ThemeSetting[]
  | { [key: string]: unknown }

export interface ThemeBlock {
  ulid?: string
  id: string
  type: string
  settings: Record<string, ThemeSetting>
  hidden?: boolean
}

export interface ThemeSection {
  ulid?: string
  id: string
  type: string
  settings: Record<string, ThemeSetting>
  blocks?: ThemeBlock[]
  hidden?: boolean
  orphaned?: boolean
}

export interface StorefrontPage {
  ulid?: string
  id: string
  type: string
  slug?: string | null
  name?: string | LocalizedValue
  sections: ThemeSection[]
}

export interface ThemeSettings {
  primary_color?: string
  secondary_color?: string
  background_color?: string
  foreground_color?: string
  heading_font?: string
  body_font?: string
  [key: string]: ThemeSetting | undefined
}

export interface ThemeDescriptor {
  ulid?: string
  handle?: string
  version?: string | null
  name?: string
}

export interface PublishedTheme {
  theme?: ThemeDescriptor | null
  settings: ThemeSettings
  has_unpublished_changes?: boolean
  published_at?: string | null
}
