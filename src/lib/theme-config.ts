/**
 * Theme configuration from environment variables
 * No database calls = instant page load
 */

export interface ThemeConfig {
  primary_color: string
  secondary_color: string
}

export interface MenuThemeConfig extends ThemeConfig {
  item_text_color: string
  category_text_color: string
  card_bg_color: string
  feature_color: string
  legend_hybrid_color: string
  legend_sativa_color: string
  legend_indica_color: string
}

export function getThemeConfig(): ThemeConfig {
  return {
    primary_color: process.env.NEXT_PUBLIC_PRIMARY_COLOR || '#536C4A',
    secondary_color: process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#B0BF93',
  }
}

export function getMenuThemeConfig(): MenuThemeConfig {
  return {
    ...getThemeConfig(),
    item_text_color: process.env.NEXT_PUBLIC_ITEM_TEXT_COLOR || '#1f2937',
    category_text_color: process.env.NEXT_PUBLIC_CATEGORY_TEXT_COLOR || '#ffffff',
    card_bg_color: process.env.NEXT_PUBLIC_CARD_BG_COLOR || '#ffffff',
    feature_color: process.env.NEXT_PUBLIC_FEATURE_COLOR || '#536C4A',
    legend_hybrid_color: process.env.NEXT_PUBLIC_LEGEND_HYBRID_COLOR || '#4f7bff',
    legend_sativa_color: process.env.NEXT_PUBLIC_LEGEND_SATIVA_COLOR || '#ff6633',
    legend_indica_color: process.env.NEXT_PUBLIC_LEGEND_INDICA_COLOR || '#38b24f',
  }
}

