'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase-client'
import type { MenuItem } from '@/lib/supabase-client'
import { revalidateTag } from 'next/cache'
import { formatCurrencyTHB } from '@/lib/currency'

interface EditableMenuItem extends MenuItem {
  isEditing?: boolean
  originalData?: MenuItem
}

export default function MenuAdminPage() {
  const [items, setItems] = useState<EditableMenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  
  const supabase = createClientComponentClient()

  // Load menu items
  useEffect(() => {
    loadMenuItems()
  }, [])

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category, name')
      
      if (error) throw error
      
      setItems(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

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

      if (error) {
        // Log full supabase error for debugging
        console.error('Failed to save item', { id, error })
        setError(error.message + (error.details ? ` — ${error.details}` : ''))
        return
      }

      setItems(prev => prev.map(i => 
        i.id === id 
          ? { ...i, isEditing: false, originalData: undefined }
          : i
      ))

      // Trigger revalidation of public pages
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/menu' })
      })

      // Refresh items to reflect latest DB state and ensure edit row closes
      await loadMenuItems()

    } catch (err) {
      console.error('Unexpected save error', err)
      setError(err instanceof Error ? err.message : 'Failed to save item')
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems(items.filter(i => i.id !== id))

      // Trigger revalidation
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/menu' })
      })

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
          category: categoryFilter || '',
          name: '',
          type: 'hybrid',
          price_5g: 0,
        })
        .select()
        .single()

      if (error) throw error

      // Добавляем новую строку наверх и сразу переводим в режим редактирования
      setItems([{ ...data, isEditing: true }, ...items])

      // Пролистываем к началу и фокусируем первый инпут новой строки
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setTimeout(() => {
          const firstInput = document.querySelector('tr.bg-blue-50 input') as HTMLInputElement | null
          firstInput?.focus()
        }, 150)
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  // Filter items
  const filteredItems = items.filter(item => {
    const search = filter.toLowerCase()
    const matchesSearch = !search ||
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search)

    const matchesCategory = !categoryFilter || item.category === categoryFilter

    // Keep row visible while editing even if it no longer matches search
    if (item.isEditing) {
      return matchesCategory
    }

    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = [...new Set(items.map(item => item.category))].sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#536C4A]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Items</h1>
            <p className="text-gray-600">Edit menu items, prices, and categories</p>
          </div>
          <button
            onClick={addNewItem}
            disabled={saving}
            className="bg-[#536C4A] text-white px-4 py-2 rounded-lg hover:bg-[#536C4A]/90 disabled:opacity-50 transition-colors whitespace-nowrap inline-flex items-center"
          >
            +{'\u00A0'}Add
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

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  THC
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  5g Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
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
                  categoryOptions={categories}
                  saving={saving}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No items found matching your filters.
        </div>
      )}
    </div>
  )
}

// Individual row component
interface MenuItemRowProps {
  item: EditableMenuItem
  onStartEdit: () => void
  onCancelEdit: () => void
  onSave: () => void
  onDelete: () => void
  onUpdateField: (field: keyof MenuItem, value: string | number | boolean | null) => void
  categoryOptions: string[]
  saving: boolean
}

function MenuItemRow({ 
  item, 
  onStartEdit, 
  onCancelEdit, 
  onSave, 
  onDelete, 
  onUpdateField, 
  categoryOptions,
  saving 
}: MenuItemRowProps) {
  if (item.isEditing) {
    return (
      <tr className="bg-blue-50">
        <td className="px-4 py-3">
          {/* Category Select with typeahead and new option */}
          <input
            list={`cat-options-${item.id}`}
            value={item.category}
            onChange={(e) => onUpdateField('category', e.target.value)}
            placeholder="Select or type new"
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
          <datalist id={`cat-options-${item.id}`}>
            {categoryOptions.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
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
            className="text-gray-600 hover:text-gray-800"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  )
}
