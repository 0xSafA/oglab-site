'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase-client'
import { UploadDropzone } from '@/lib/uploadthing'
import type { Theme } from '@/lib/supabase-client'

export default function ThemeAdminPage() {
  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    primary_color: '#536C4A',
    secondary_color: '#B0BF93',
    logo_url: '',
    tier0_label: '1PC',
    tier1_label: '1G',
    tier2_label: '5G+',
    tier3_label: '20G+',
    legend_hybrid: 'Hybrid',
    legend_sativa: 'Sativa',
    legend_indica: 'Indica',
    feature_label: 'Farm-grown',
    tip_label: 'Batches from 5g',
    legend_hybrid_color: '#4f7bff',
    legend_sativa_color: '#ff6633',
    legend_indica_color: '#38b24f',
    feature_color: '#536C4A',
    item_text_color: '#1f2937',
    category_text_color: '#ffffff',
    card_bg_color: '#ffffff',
    event_text: '',
    offer_text: '',
    offer_enable_particles: true,
    offer_enable_cosmic_glow: true,
    offer_enable_floating: true,
    offer_enable_pulse: true,
    offer_enable_inner_light: true
  })
  
  const supabase = createClientComponentClient()

  const loadTheme = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('theme')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error
      }
      
      if (data) {
        setTheme(data)
        setFormData({
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          logo_url: data.logo_url || '',
          tier0_label: data.tier0_label || '1PC',
          tier1_label: data.tier1_label || '1G',
          tier2_label: data.tier2_label || '5G+',
          tier3_label: data.tier3_label || '20G+',
          legend_hybrid: data.legend_hybrid || 'Hybrid',
          legend_sativa: data.legend_sativa || 'Sativa',
          legend_indica: data.legend_indica || 'Indica',
          feature_label: data.feature_label || 'Farm-grown',
          tip_label: data.tip_label || 'Batches from 5g',
          legend_hybrid_color: data.legend_hybrid_color || '#4f7bff',
          legend_sativa_color: data.legend_sativa_color || '#ff6633',
          legend_indica_color: data.legend_indica_color || '#38b24f',
          feature_color: data.feature_color || '#536C4A',
          item_text_color: data.item_text_color || '#1f2937',
          category_text_color: data.category_text_color || '#ffffff',
          card_bg_color: data.card_bg_color || '#ffffff',
          event_text: data.event_text || '',
          offer_text: data.offer_text || '',
          offer_enable_particles: data.offer_enable_particles ?? true,
          offer_enable_cosmic_glow: data.offer_enable_cosmic_glow ?? true,
          offer_enable_floating: data.offer_enable_floating ?? true,
          offer_enable_pulse: data.offer_enable_pulse ?? true,
          offer_enable_inner_light: data.offer_enable_inner_light ?? true
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load theme')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadTheme()
  }, [loadTheme])

  const saveTheme = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (theme && theme.id) {
        // Update existing theme
        const { error } = await supabase
          .from('theme')
          .update(formData)
          .eq('id', theme.id)
        
        if (error) throw error
      } else {
        // Create new theme
        const { data, error } = await supabase
          .from('theme')
          .insert(formData)
          .select()
          .single()
        
        if (error) throw error
        setTheme(data)
      }

      setSuccess('Theme saved successfully!')
      
      // Trigger revalidation of public pages
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/' })
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save theme')
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = () => {
    setFormData({
      primary_color: '#536C4A',
      secondary_color: '#B0BF93',
      logo_url: formData.logo_url || '',
      tier0_label: '1PC',
      tier1_label: '1G',
      tier2_label: '5G+',
      tier3_label: '20G+',
      legend_hybrid: 'Hybrid',
      legend_sativa: 'Sativa',
      legend_indica: 'Indica',
      feature_label: 'Farm-grown',
      tip_label: 'Batches from 5g',
      legend_hybrid_color: '#4f7bff',
      legend_sativa_color: '#ff6633',
      legend_indica_color: '#38b24f',
      feature_color: '#536C4A',
      item_text_color: '#1f2937',
      category_text_color: '#ffffff',
      card_bg_color: '#ffffff',
      event_text: '',
      offer_text: '',
      offer_enable_particles: true,
      offer_enable_cosmic_glow: true,
      offer_enable_floating: true,
      offer_enable_pulse: true,
      offer_enable_inner_light: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#536C4A]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Theme</h1>
        <p className="text-gray-600">
          Customize your site&apos;s appearance and upload a custom logo
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
          <button 
            onClick={() => setSuccess(null)}
            className="ml-2 text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Color Settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-6 h-6 rounded-md cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                  placeholder="#536C4A"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Used for headers, buttons, and accent elements
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="w-6 h-6 rounded-md cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                  placeholder="#B0BF93"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Used for gradients and lighter elements
              </p>
            </div>

            {/* Item text color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item text color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.item_text_color}
                  onChange={(e) => setFormData({ ...formData, item_text_color: e.target.value })}
                  className="w-6 h-6 rounded-md cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={formData.item_text_color}
                  onChange={(e) => setFormData({ ...formData, item_text_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                />
              </div>
            </div>

            {/* Category text color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category text color</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.category_text_color}
                  onChange={(e) => setFormData({ ...formData, category_text_color: e.target.value })}
                  className="w-6 h-6 rounded-md cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={formData.category_text_color}
                  onChange={(e) => setFormData({ ...formData, category_text_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                />
              </div>
            </div>

            {/* Card background color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.card_bg_color}
                  onChange={(e) => setFormData({ ...formData, card_bg_color: e.target.value })}
                  className="w-6 h-6 rounded-md cursor-pointer border-none"
                />
                <input
                  type="text"
                  value={formData.card_bg_color}
                  onChange={(e) => setFormData({ ...formData, card_bg_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Color of menu cards background</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={saveTheme}
                disabled={saving}
                className="bg-[#536C4A] text-white px-4 py-2 rounded-lg hover:bg-[#536C4A]/90 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={resetToDefault}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo Upload</h2>
          
          {formData.logo_url && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Logo
              </label>
              <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={formData.logo_url} 
                alt="Current logo" 
                className="w-16 h-16 object-contain"
              />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 break-all">
                    {formData.logo_url}
                  </p>
                  <button
                    onClick={() => setFormData({ ...formData, logo_url: '' })}
                    className="text-red-600 hover:text-red-800 text-sm mt-1"
                  >
                    Remove Logo
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload New Logo (SVG only, max 200KB)
              </label>
              <UploadDropzone
                endpoint="logoUploader"
                onClientUploadComplete={(res) => {
                  if (res && res[0]) {
                    setFormData({ ...formData, logo_url: res[0].url })
                    setSuccess('Logo uploaded successfully!')
                  }
                }}
                onUploadError={(error: Error) => {
                  setError(`Upload failed: ${error.message}`)
                }}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#536C4A] transition-colors"
              />
            </div>
            
            <div className="text-sm text-gray-500">
              <p><strong>Requirements:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>SVG format only</li>
                <li>Maximum file size: 200KB</li>
                <li>Recommended dimensions: square aspect ratio</li>
                <li>Will be displayed at 32x32px in the menu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Page settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Main Page</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Offer text</label>
          <input
            type="text"
            value={formData.offer_text}
            onChange={(e) => setFormData({ ...formData, offer_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
          />
        </div>
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Event text</label>
          <input
            type="text"
            value={formData.event_text}
            onChange={(e) => setFormData({ ...formData, event_text: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
          />
        </div>
        <div className="mt-4">
          <button
            onClick={saveTheme}
            disabled={saving}
            className="bg-[#536C4A] text-white px-4 py-2 rounded-lg hover:bg-[#536C4A]/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Offer Animations Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Offer Pill Animations</h2>
        <p className="text-gray-600 mb-6">
          Control the magical animations on the offer pill
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="offer_enable_particles"
                checked={formData.offer_enable_particles}
                onChange={(e) => setFormData({ ...formData, offer_enable_particles: e.target.checked })}
                className="w-4 h-4 text-[#536C4A] bg-gray-100 border-gray-300 rounded focus:ring-[#536C4A] focus:ring-2"
              />
              <label htmlFor="offer_enable_particles" className="ml-3 text-sm font-medium text-gray-700">
                Flying Particles
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500 mt-1">Colorful particles floating around the pill</p>
          </div>

          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="offer_enable_cosmic_glow"
                checked={formData.offer_enable_cosmic_glow}
                onChange={(e) => setFormData({ ...formData, offer_enable_cosmic_glow: e.target.checked })}
                className="w-4 h-4 text-[#536C4A] bg-gray-100 border-gray-300 rounded focus:ring-[#536C4A] focus:ring-2"
              />
              <label htmlFor="offer_enable_cosmic_glow" className="ml-3 text-sm font-medium text-gray-700">
                Cosmic Glow
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500 mt-1">Multi-colored glowing border effect</p>
          </div>

          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="offer_enable_floating"
                checked={formData.offer_enable_floating}
                onChange={(e) => setFormData({ ...formData, offer_enable_floating: e.target.checked })}
                className="w-4 h-4 text-[#536C4A] bg-gray-100 border-gray-300 rounded focus:ring-[#536C4A] focus:ring-2"
              />
              <label htmlFor="offer_enable_floating" className="ml-3 text-sm font-medium text-gray-700">
                Floating Movement
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500 mt-1">Gentle up and down movement</p>
          </div>

          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="offer_enable_pulse"
                checked={formData.offer_enable_pulse}
                onChange={(e) => setFormData({ ...formData, offer_enable_pulse: e.target.checked })}
                className="w-4 h-4 text-[#536C4A] bg-gray-100 border-gray-300 rounded focus:ring-[#536C4A] focus:ring-2"
              />
              <label htmlFor="offer_enable_pulse" className="ml-3 text-sm font-medium text-gray-700">
                Magic Pulse
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500 mt-1">Rhythmic size pulsation</p>
          </div>

          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="offer_enable_inner_light"
                checked={formData.offer_enable_inner_light}
                onChange={(e) => setFormData({ ...formData, offer_enable_inner_light: e.target.checked })}
                className="w-4 h-4 text-[#536C4A] bg-gray-100 border-gray-300 rounded focus:ring-[#536C4A] focus:ring-2"
              />
              <label htmlFor="offer_enable_inner_light" className="ml-3 text-sm font-medium text-gray-700">
                Inner Light
              </label>
            </div>
            <p className="ml-7 text-xs text-gray-500 mt-1">Golden glow from inside the pill</p>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={saveTheme}
            disabled={saving}
            className="bg-[#536C4A] text-white px-4 py-2 rounded-lg hover:bg-[#536C4A]/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Animations'}
          </button>
        </div>
      </div>

      {/* Tier labels settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Labels</h2>
        <h3 className="text-md font-semibold text-gray-800 mb-3">Price Tiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier 0</label>
            <input
              type="text"
              value={formData.tier0_label}
              onChange={(e) => setFormData({ ...formData, tier0_label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier 1</label>
            <input
              type="text"
              value={formData.tier1_label}
              onChange={(e) => setFormData({ ...formData, tier1_label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier 2</label>
            <input
              type="text"
              value={formData.tier2_label}
              onChange={(e) => setFormData({ ...formData, tier2_label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier 3</label>
            <input
              type="text"
              value={formData.tier3_label}
              onChange={(e) => setFormData({ ...formData, tier3_label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
            />
          </div>
        </div>
        <h3 className="text-md font-semibold text-gray-800 mt-8 mb-3">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hybrid</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.legend_hybrid}
                onChange={(e) => setFormData({ ...formData, legend_hybrid: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
              <input
                type="color"
                value={formData.legend_hybrid_color}
                onChange={(e) => setFormData({ ...formData, legend_hybrid_color: e.target.value })}
                className="w-6 h-6 border border-gray-300 rounded-md"
                aria-label="Hybrid color"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sativa</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.legend_sativa}
                onChange={(e) => setFormData({ ...formData, legend_sativa: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
              <input
                type="color"
                value={formData.legend_sativa_color}
                onChange={(e) => setFormData({ ...formData, legend_sativa_color: e.target.value })}
                className="w-6 h-6 border border-gray-300 rounded-md"
                aria-label="Sativa color"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indica</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.legend_indica}
                onChange={(e) => setFormData({ ...formData, legend_indica: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
              <input
                type="color"
                value={formData.legend_indica_color}
                onChange={(e) => setFormData({ ...formData, legend_indica_color: e.target.value })}
                className="w-6 h-6 border border-gray-300 rounded-md"
                aria-label="Indica color"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Feature</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={formData.feature_label}
                onChange={(e) => setFormData({ ...formData, feature_label: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
              <input
                type="color"
                value={formData.feature_color}
                onChange={(e) => setFormData({ ...formData, feature_color: e.target.value })}
                className="w-6 h-6 border border-gray-300 rounded-md"
                aria-label="Feature color"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
            <input
              type="text"
              value={formData.tip_label}
              onChange={(e) => setFormData({ ...formData, tip_label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
            />
          </div>
        </div>

        {/* Removed duplicate color pickers (Item text, Category text, Card background) from Labels section */}

        <div className="mt-6">
          <button
            onClick={saveTheme}
            disabled={saving}
            className="bg-[#536C4A] text-white px-4 py-2 rounded-lg hover:bg-[#536C4A]/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
        
        <div 
          className="rounded-lg p-6 text-white"
          style={{ 
            background: `linear-gradient(to bottom right, ${formData.primary_color}, ${formData.secondary_color})` 
          }}
        >
          <div className="flex items-center space-x-3 mb-4">
            {formData.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img 
                src={formData.logo_url} 
                alt="Logo preview" 
                className="w-8 h-8 object-contain bg-white rounded-full p-1"
              />
            )}
            <h3 className="text-xl font-bold">OG Lab Menu</h3>
          </div>
          
          <div className="bg-white/95 backdrop-blur-lg rounded-lg p-4 text-gray-900">
                <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Sample Menu Item</span>
                  <span style={{ color: formData.primary_color }}>{formData.tier2_label}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: '#4f7bff' }}
              ></div>
              <span className="text-sm text-gray-600">Hybrid • 18% THC</span>
            </div>
          </div>
        </div>
      </div>

      {/* Screen controls (bottom of Settings) */}
      <ScreenControlsFooter supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL as string} supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string} />
    </div>
  )
}

function ScreenControlsFooter({ supabaseUrl, supabaseKey }: { supabaseUrl?: string; supabaseKey?: string }) {
  const [busy, setBusy] = useState(false)
  const canBroadcast = !!supabaseUrl && !!supabaseKey

  const send = async (event: 'soft-refresh' | 'hard-refresh') => {
    if (!canBroadcast) return
    setBusy(true)
    try {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(supabaseUrl!, supabaseKey!)
      const channel = sb.channel('realtime-menu')
      await channel.subscribe()
      await channel.send({ type: 'broadcast', event })
      setTimeout(() => channel.unsubscribe(), 500)
    } catch (e) {
      console.error('Failed to send broadcast', e)
    } finally {
      setBusy(false)
    }
  }

  if (!canBroadcast) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Screens control</h2>
      <p className="text-gray-600 mb-4">Manage TV screens without leaving Settings.</p>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => send('soft-refresh')}
          disabled={busy}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Soft refresh
        </button>
        <button
          onClick={() => send('hard-refresh')}
          disabled={busy}
          className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          Hard reload
        </button>
      </div>
    </div>
  )
}
