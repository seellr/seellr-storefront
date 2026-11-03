export type StoreLocale = 'ar' | 'en'
export type ThemeSetting = string | number | boolean | null | { ar: string; en: string }
export interface ThemeBlock { id: string; type: string; settings: Record<string, ThemeSetting>; hidden?: boolean }
export interface ThemeSection { id: string; type: string; settings: Record<string, ThemeSetting>; blocks?: ThemeBlock[]; hidden?: boolean }
export interface StorefrontPage { id: string; type: string; sections: ThemeSection[] }
export interface ThemeSettings { primary_color?: string; secondary_color?: string; background_color?: string; foreground_color?: string; heading_font?: string; body_font?: string; [key: string]: string | undefined }
