'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase-client'
import { UploadDropzone } from '@/lib/uploadthing'
import { formatCurrencyTHB } from '@/lib/currency'
import type { MenuItem, Theme } from '@/lib/supabase-client'

interface EditableMenuItem extends MenuItem {
  isEditing?: boolean
  originalData?: MenuItem
}

export default function AdminTabs() {
  const [activeTab, setActiveTab] = useState('menu')
  const [items, setItems] = useState<EditableMenuItem[]>([])
  const [theme, setTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  
  // Theme form data
  const [formData, setFormData] = useState({
    primary_color: '#536C4A',
    secondary_color: '#B0BF93',
    logo_url: ''
  })
  
  const supabase = createClientComponentClient()

  const tabs = [
    { id: 'menu', name: 'Items', icon: '📋' },
    { id: 'theme', name: 'Theme', icon: '🎨' },
    { id: 'settings', name: 'Settings', icon: '⚙️' }
  ]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [menuResult, themeResult] = await Promise.all([
        supabase.from('menu_items').select('*').order('category, name'),
        supabase.from('theme').select('*').single()
      ])
      
      if (menuResult.error) throw menuResult.error
      if (themeResult.error && themeResult.error.code !== 'PGRST116') throw themeResult.error
      
      setItems(menuResult.data || [])
      
      if (themeResult.data) {
        setTheme(themeResult.data)
        setFormData({
          primary_color: themeResult.data.primary_color,
          secondary_color: themeResult.data.secondary_color,
          logo_url: themeResult.data.logo_url || ''
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Menu functions
  const startEditing = (id: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, isEditing: true, originalData: { ...item } }
        : item
    ))
  }

  const cancelEditing = (id: string) => {
    setItems(items.map(item => 
      item.id === id && item.originalData
        ? { ...item.originalData, isEditing: false, originalData: undefined }
        : item
    ))
  }

  const updateField = (id: string, field: keyof MenuItem, value: string | number | boolean | null) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, [field]: value }
        : item
    ))
  }

  const saveItem = async (id: string) => {
    const item = items.find(i => i.id === id)
    if (!item) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('menu_items')
        .update({
          category: item.category,
          name: item.name,
          type: item.type,
          thc: item.thc,
          cbg: item.cbg,
          price_1pc: item.price_1pc,
          price_1g: item.price_1g,
          price_5g: item.price_5g,
          price_20g: item.price_20g,
          our: item.our,
        })
        .eq('id', id)

      if (error) throw error

      setItems(items.map(i => 
        i.id === id 
          ? { ...i, isEditing: false, originalData: undefined }
          : i
      ))

      // Trigger revalidation
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/menu' })
      })

      setSuccess('Item updated successfully!')
      setTimeout(() => setSuccess(null), 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      setSaving(true)
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems(items.filter(i => i.id !== id))

      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/menu' })
      })

      setSuccess('Item deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item')
    } finally {
      setSaving(false)
    }
  }

  const addNewItem = async () => {
    try {
      setSaving(true)
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          category: 'NEW CATEGORY',
          name: 'New Item',
          type: 'hybrid',
          price_5g: 0,
        })
        .select()
        .single()

      if (error) throw error

      setItems([...items, { ...data, isEditing: true }])
      setSuccess('New item added!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  // Theme functions
  const saveTheme = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      if (theme) {
        const { error } = await supabase
          .from('theme')
          .update(formData)
          .eq('id', theme.id)
        
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('theme')
          .insert(formData)
          .select()
          .single()
        
        if (error) throw error
        setTheme(data)
      }

      setSuccess('Theme saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
      
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
      logo_url: formData.logo_url
    })
  }

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = !filter || 
      item.name.toLowerCase().includes(filter.toLowerCase()) ||
      item.category.toLowerCase().includes(filter.toLowerCase())
    
    const matchesCategory = !categoryFilter || item.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(items.map(item => item.category))].sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#536C4A]"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs Header */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-[#536C4A] text-[#536C4A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
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
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
            <button 
              onClick={() => setSuccess(null)}
              className="ml-2 text-green-500 hover:text-green-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Menu Items</h2>
              <button
                onClick={addNewItem}
                disabled={saving}
                className="bg-[#536C4A] text-white px-4 py-2 rounded-lg hover:bg-[#536C4A]/90 disabled:opacity-50 transition-colors"
              >
                Add New Item
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search items..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">THC</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">5g Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      onStartEdit={() => startEditing(item.id)}
                      onCancelEdit={() => cancelEditing(item.id)}
                      onSave={() => saveItem(item.id)}
                      onDelete={() => deleteItem(item.id)}
                      onUpdateField={(field, value) => updateField(item.id, field, value)}
                      saving={saving}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No items found matching your filters.
              </div>
            )}
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="space-y-8">
            <h2 className="text-xl font-semibold text-gray-900">Theme</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Color Settings */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Colors</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#536C4A] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={saveTheme}
                    disabled={saving}
                    className="bg-[#536C4A] text-white px-4 py-2 rounded-lg hover:bg-[#536C4A]/90 disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save Colors'}
                  </button>
                  <button
                    onClick={resetToDefault}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Logo</h3>
                
                {formData.logo_url && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Logo</label>
                    <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={formData.logo_url} 
                        alt="Current logo" 
                        className="w-16 h-16 object-contain"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 break-all">{formData.logo_url}</p>
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
                        setTimeout(() => setSuccess(null), 3000)
                      }
                    }}
                    onUploadError={(error: Error) => {
                      setError(`Upload failed: ${error.message}`)
                    }}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#536C4A] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Preview</h3>
              <div 
                className="rounded-lg p-6 text-white"
                style={{ 
                  background: `linear-gradient(to bottom right, ${formData.primary_color}, ${formData.secondary_color})` 
                }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  {formData.logo_url && (
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
                    <span style={{ color: formData.primary_color }}>฿25</span>
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
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">System Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Database Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Menu Items</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {items.length} items
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-600">Theme Configuration</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {theme ? 'Configured' : 'Default'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => window.open('/', '_blank')}
                    className="w-full text-left px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Public Site →
                  </button>
                  <button
                    onClick={() => window.open('/menu', '_blank')}
                    className="w-full text-left px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    View Menu Page →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Menu Item Row Component
interface MenuItemRowProps {
  item: EditableMenuItem
  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onDelete: () => void
  onUpdateField: (field: keyof MenuItem, value: string | number | boolean | null) => void
  saving: boolean
}

function MenuItemRow({ 
  item, 
  onStartEdit, 
  onCancelEdit, 
  onSave, 
  onDelete, 
  onUpdateField, 
  saving 
}: MenuItemRowProps) {
  if (item.isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-4 py-3">
          <input
            type="text"
            value={item.category}
            onChange={(e) => onUpdateField('category', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={item.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <select
            value={item.type || ''}
            onChange={(e) => onUpdateField('type', e.target.value || null)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">-</option>
            <option value="hybrid">Hybrid</option>
            <option value="sativa">Sativa</option>
            <option value="indica">Indica</option>
          </select>
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            step="0.01"
            value={item.thc || ''}
            onChange={(e) => onUpdateField('thc', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            step="0.01"
            value={item.price_5g || ''}
            onChange={(e) => onUpdateField('price_5g', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <div className="flex space-x-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="text-green-600 hover:text-green-800 disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={onCancelEdit}
              disabled={saving}
              className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
      <td className="px-4 py-3 text-sm">
        {item.type && (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            item.type === 'hybrid' ? 'bg-blue-100 text-blue-800' :
            item.type === 'sativa' ? 'bg-orange-100 text-orange-800' :
            'bg-green-100 text-green-800'
          }`}>
            {item.type}
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {item.thc ? `${item.thc}%` : '-'}
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">
        {formatCurrencyTHB(item.price_5g)}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex space-x-2">
          <button
            onClick={onStartEdit}
            className="text-[#536C4A] hover:text-[#536C4A]/80"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
