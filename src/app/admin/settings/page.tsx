'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchDynamicSettingsClient, updateDynamicSettings, type DynamicSettings } from '@/lib/dynamic-settings'

export default function DynamicSettingsPage() {
  const [settings, setSettings] = useState<DynamicSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    event_text: '',
    offer_text: '',
    offer_hide: false,
    offer_enable_particles: true,
    offer_enable_cosmic_glow: true,
    offer_enable_floating: true,
    offer_enable_pulse: true,
    offer_enable_inner_light: true,
    tier0_label: '1PC',
    tier1_label: '1G',
    tier2_label: '5G+',
    tier3_label: '20G+',
    legend_hybrid: 'Hybrid',
    legend_sativa: 'Sativa',
    legend_indica: 'Indica',
    feature_label: 'Farm-grown',
    tip_label: 'Batches from 5g'
  })

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchDynamicSettingsClient()
      
      if (data) {
        setSettings(data)
        setFormData({
          event_text: data.event_text || '',
          offer_text: data.offer_text || '',
          offer_hide: data.offer_hide ?? false,
          offer_enable_particles: data.offer_enable_particles ?? true,
          offer_enable_cosmic_glow: data.offer_enable_cosmic_glow ?? true,
          offer_enable_floating: data.offer_enable_floating ?? true,
          offer_enable_pulse: data.offer_enable_pulse ?? true,
          offer_enable_inner_light: data.offer_enable_inner_light ?? true,
          tier0_label: data.tier0_label || '1PC',
          tier1_label: data.tier1_label || '1G',
          tier2_label: data.tier2_label || '5G+',
          tier3_label: data.tier3_label || '20G+',
          legend_hybrid: data.legend_hybrid || 'Hybrid',
          legend_sativa: data.legend_sativa || 'Sativa',
          legend_indica: data.legend_indica || 'Indica',
          feature_label: data.feature_label || 'Farm-grown',
          tip_label: data.tip_label || 'Batches from 5g'
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const result = await updateDynamicSettings(settings.id, formData)

      if (result.success) {
        setSuccess('Settings updated successfully!')
        await loadSettings()
      } else {
        setError(result.error || 'Failed to update settings')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings')
    } finally {
      setSaving(false)
    }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
        {settings && (
          settings.offer_enable_particles === undefined && (
            <div className="mt-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded px-3 py-2">
              ℹ️ New animation settings available! Run <code className="bg-blue-100 px-2 py-0.5 rounded">supabase/add-animation-settings.sql</code> migration to enable them.
            </div>
          )
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right font-bold"
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
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Page Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Main Page Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offer Text
              </label>
              <input
                type="text"
                value={formData.offer_text}
                onChange={(e) => setFormData({ ...formData, offer_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                placeholder="Special offer available now!"
              />
              <p className="text-xs text-gray-500 mt-1">Shown in the offer banner on homepage</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Text
              </label>
              <input
                type="text"
                value={formData.event_text}
                onChange={(e) => setFormData({ ...formData, event_text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                placeholder="Next party is coming soon!"
              />
              <p className="text-xs text-gray-500 mt-1">Event announcement below the offer</p>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.offer_hide}
                  onChange={(e) => setFormData({ ...formData, offer_hide: e.target.checked })}
                  className="rounded border-gray-300 text-[#536C4A] focus:ring-[#536C4A]"
                />
                <span className="text-sm font-medium text-gray-700">Hide Offer Banner</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-6">Check to temporarily hide the offer section</p>
            </div>

            {/* Animation Settings */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Animation Settings</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.offer_enable_particles}
                    onChange={(e) => setFormData({ ...formData, offer_enable_particles: e.target.checked })}
                    className="rounded border-gray-300 text-[#536C4A] focus:ring-[#536C4A]"
                  />
                  <span className="text-sm text-gray-700">Enable Particles</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.offer_enable_cosmic_glow}
                    onChange={(e) => setFormData({ ...formData, offer_enable_cosmic_glow: e.target.checked })}
                    className="rounded border-gray-300 text-[#536C4A] focus:ring-[#536C4A]"
                  />
                  <span className="text-sm text-gray-700">Enable Cosmic Glow</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.offer_enable_floating}
                    onChange={(e) => setFormData({ ...formData, offer_enable_floating: e.target.checked })}
                    className="rounded border-gray-300 text-[#536C4A] focus:ring-[#536C4A]"
                  />
                  <span className="text-sm text-gray-700">Enable Floating Animation</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.offer_enable_pulse}
                    onChange={(e) => setFormData({ ...formData, offer_enable_pulse: e.target.checked })}
                    className="rounded border-gray-300 text-[#536C4A] focus:ring-[#536C4A]"
                  />
                  <span className="text-sm text-gray-700">Enable Pulse Animation</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.offer_enable_inner_light}
                    onChange={(e) => setFormData({ ...formData, offer_enable_inner_light: e.target.checked })}
                    className="rounded border-gray-300 text-[#536C4A] focus:ring-[#536C4A]"
                  />
                  <span className="text-sm text-gray-700">Enable Inner Light</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Labels Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Menu Labels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tier 0 Label (1 piece)
              </label>
              <input
                type="text"
                value={formData.tier0_label}
                onChange={(e) => setFormData({ ...formData, tier0_label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tier 1 Label (1 gram)
              </label>
              <input
                type="text"
                value={formData.tier1_label}
                onChange={(e) => setFormData({ ...formData, tier1_label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tier 2 Label (5+ grams)
              </label>
              <input
                type="text"
                value={formData.tier2_label}
                onChange={(e) => setFormData({ ...formData, tier2_label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tier 3 Label (20+ grams)
              </label>
              <input
                type="text"
                value={formData.tier3_label}
                onChange={(e) => setFormData({ ...formData, tier3_label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Legend Labels Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Legend Labels
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hybrid Label
              </label>
              <input
                type="text"
                value={formData.legend_hybrid}
                onChange={(e) => setFormData({ ...formData, legend_hybrid: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sativa Label
              </label>
              <input
                type="text"
                value={formData.legend_sativa}
                onChange={(e) => setFormData({ ...formData, legend_sativa: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Indica Label
              </label>
              <input
                type="text"
                value={formData.legend_indica}
                onChange={(e) => setFormData({ ...formData, legend_indica: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feature Label
              </label>
              <input
                type="text"
                value={formData.feature_label}
                onChange={(e) => setFormData({ ...formData, feature_label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">E.g., &quot;Farm-grown&quot;</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tip Label
              </label>
              <input
                type="text"
                value={formData.tip_label}
                onChange={(e) => setFormData({ ...formData, tip_label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">E.g., &quot;Batches from 5g&quot;</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-[#536C4A] text-white rounded-lg font-semibold hover:bg-[#536C4A]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}

