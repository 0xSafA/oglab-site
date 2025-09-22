'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@/lib/supabase-client'
import type { MenuItem } from '@/lib/supabase-client'
import { formatCurrencyTHB } from '@/lib/currency'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  const [tierLabels, setTierLabels] = useState({
    tier0: '1PC',
    tier1: '1G',
    tier2: '5G+',
    tier3: '20G+'
  })
  const [manageOpen, setManageOpen] = useState(false)
  const [layoutId, setLayoutId] = useState<string | null>(null)
  const [column1, setColumn1] = useState<string[]>([])
  const [column2, setColumn2] = useState<string[]>([])
  const [column3, setColumn3] = useState<string[]>([])
  const [hiddenCats, setHiddenCats] = useState<string[]>([])

  const supabase = createClientComponentClient()

  // Load menu items
  const loadMenuItems = useCallback(async () => {
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
  }, [supabase])

  const loadThemeLabels = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('theme')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setTierLabels({
          tier0: data.tier0_label || '1PC',
          tier1: data.tier1_label || '1G',
          tier2: data.tier2_label || '5G+',
          tier3: data.tier3_label || '20G+',
        })
      }
    } catch {
      // ignore, use defaults
    }
  }, [supabase])

  const loadMenuLayout = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('menu_layout')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      const uniqueCats = [...new Set(items.map(i => i.category))]

      if (data) {
        setLayoutId((data as { id?: string }).id || null)
        // Use layout, but ensure only categories that exist in items unless user added custom
        setColumn1((data.column1 || []).filter(Boolean))
        setColumn2((data.column2 || []).filter(Boolean))
        setColumn3((data.column3 || []).filter(Boolean))
        setHiddenCats((data.hidden || []).filter(Boolean))

        // Append any missing categories into column1 by default (not hidden)
        const inLayout = new Set<string>([...data.column1, ...data.column2, ...data.column3, ...(data.hidden || [])])
        const missing = uniqueCats.filter(c => !inLayout.has(c))
        if (missing.length) setColumn1(prev => [...prev, ...missing])
      } else {
        // No layout yet – seed from current categories
        const cats = uniqueCats
        const chunk = Math.ceil(cats.length / 3)
        setColumn1(cats.slice(0, chunk))
        setColumn2(cats.slice(chunk, chunk * 2))
        setColumn3(cats.slice(chunk * 2))
        setHiddenCats([])
      }
    } catch (e) {
      console.error('Failed to load menu layout', e)
    }
  }, [supabase, items])

  useEffect(() => {
    loadMenuItems()
    loadThemeLabels()
  }, [loadMenuItems, loadThemeLabels])

  useEffect(() => {
    if (items.length >= 0) {
      loadMenuLayout()
    }
  }, [items, loadMenuLayout])

  const startEditing = (id: string) => {
    setItems(items.map(item => 
      item.id === id 
        ? { ...item, isEditing: true, originalData: { ...item } }
        : item
    ))
  }

  const cancelEditing = async (id: string) => {
    const target = items.find(i => i.id === id)
    if (!target) return

    // If this is an existing item (has originalData), just revert changes
    if (target.originalData) {
      setItems(items.map(item => 
        item.id === id && item.originalData
          ? { ...item.originalData, isEditing: false, originalData: undefined }
          : item
      ))
      return
    }

    // New item (no originalData): delete it from DB and remove from list
    await deleteItem(id)
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
          const firstInput = document.querySelector('tr.bg-gray-50 input') as HTMLInputElement | null
          firstInput?.focus()
        }, 150)
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  // Persist layout changes
  const saveLayout = async () => {
    try {
      setSaving(true)
      const payload: { column1: string[]; column2: string[]; column3: string[]; hidden: string[] } = {
        column1,
        column2,
        column3,
        hidden: hiddenCats,
      }

      if (layoutId) {
        const { error } = await supabase
          .from('menu_layout')
          .update(payload)
          .eq('id', layoutId)
        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('menu_layout')
          .insert(payload)
          .select()
          .single()
        if (error) throw error
        setLayoutId((data as { id?: string }).id || null)
      }

      // Revalidate public menu (Realtime also triggers a reload)
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/menu' })
      })

      setManageOpen(false)
    } catch (e) {
      console.error('Failed to save layout', e)
      setError(e instanceof Error ? e.message : 'Failed to save layout')
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
          <div className="flex gap-2">
            <button
              onClick={() => setManageOpen(true)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Categories
            </button>
            <button
              onClick={addNewItem}
              disabled={saving}
              className="bg-[#536C4A] text-white px-4 py-2 rounded-lg hover:bg-[#536C4A]/90 disabled:opacity-50 transition-colors whitespace-nowrap inline-flex items-center"
            >
              +{'\u00A0'}Add
            </button>
          </div>
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
              <option value="">All</option>
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
                  Featured
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {tierLabels.tier0}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {tierLabels.tier1}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {tierLabels.tier2}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {tierLabels.tier3}
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

      {manageOpen && (
        <ManageCategoriesModal
          column1={column1}
          column2={column2}
          column3={column3}
          hiddenCats={hiddenCats}
          onChangeColumn1={setColumn1}
          onChangeColumn2={setColumn2}
          onChangeColumn3={setColumn3}
          onChangeHidden={setHiddenCats}
          onClose={() => setManageOpen(false)}
          onSave={saveLayout}
          allKnownCategories={[...new Set([...column1, ...column2, ...column3, ...hiddenCats, ...categories])]}
          saving={saving}
        />
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
      <tr className="bg-gray-50">
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
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={!!item.our}
              onChange={(e) => onUpdateField('our', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-gray-500 focus:ring-gray-400"
            />
            <span>Our</span>
          </label>
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            step="0.01"
            value={item.price_1pc || ''}
            onChange={(e) => onUpdateField('price_1pc', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </td>
        <td className="px-4 py-3">
          <input
            type="number"
            step="0.01"
            value={item.price_1g || ''}
            onChange={(e) => onUpdateField('price_1g', e.target.value ? parseFloat(e.target.value) : null)}
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
          <input
            type="number"
            step="0.01"
            value={item.price_20g || ''}
            onChange={(e) => onUpdateField('price_20g', e.target.value ? parseFloat(e.target.value) : null)}
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
        <input type="checkbox" checked={!!item.our} readOnly className="h-4 w-4 rounded border-gray-300 accent-gray-500" />
      </td>
      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrencyTHB(item.price_1pc)}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrencyTHB(item.price_1g)}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrencyTHB(item.price_5g)}</td>
      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrencyTHB(item.price_20g)}</td>
      <td className="px-4 py-3 text-sm">
        <div className="flex space-x-2">
          <button
            onClick={onStartEdit}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            aria-label="Edit item"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M13.586 3.586a2 2 0 0 1 2.828 2.828l-9.192 9.192a2 2 0 0 1-.878.506l-3.09.883a.5.5 0 0 1-.62-.62l.883-3.09a2 2 0 0 1 .506-.878l9.192-9.192ZM12.172 5 5 12.172V15h2.828L15 7.828 12.172 5Z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
            aria-label="Delete item"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

// Drag item for categories (within a list)
function SortableItem({ id, onMoveTo, onDelete, currentList }: { id: string; onMoveTo?: (target: 'col1'|'col2'|'col3'|'hidden') => void; onDelete?: (id: string) => void; currentList: 'col1'|'col2'|'col3'|'hidden' }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded border border-gray-200">
      <span className="text-sm text-gray-800 truncate">{id}</span>
      {onMoveTo && (
        <div className="flex gap-1">
          <button className="text-xs text-gray-500 hover:text-gray-800" onClick={() => onMoveTo('col1')}>Col 1</button>
          <button className="text-xs text-gray-500 hover:text-gray-800" onClick={() => onMoveTo('col2')}>Col 2</button>
          <button className="text-xs text-gray-500 hover:text-gray-800" onClick={() => onMoveTo('col3')}>Col 3</button>
          {currentList === 'hidden'
            ? (
              onDelete && <button className="text-xs text-red-600 hover:text-red-800" onClick={(e) => { e.stopPropagation(); onDelete(id) }}>Delete</button>
            ) : (
              <button className="text-xs text-gray-500 hover:text-gray-800" onClick={() => onMoveTo('hidden')}>Hide</button>
            )}
        </div>
      )}
      {!onMoveTo && onDelete && (
        <button className="text-xs text-red-600 hover:text-red-800" onClick={(e) => { e.stopPropagation(); onDelete(id) }}>Delete</button>
      )}
    </div>
  )
}

function ManageCategoriesModal({
  column1,
  column2,
  column3,
  hiddenCats,
  onChangeColumn1,
  onChangeColumn2,
  onChangeColumn3,
  onChangeHidden,
  onClose,
  onSave,
  allKnownCategories,
  saving
}: {
  column1: string[];
  column2: string[];
  column3: string[];
  hiddenCats: string[];
  onChangeColumn1: (v: string[]) => void;
  onChangeColumn2: (v: string[]) => void;
  onChangeColumn3: (v: string[]) => void;
  onChangeHidden: (v: string[]) => void;
  onClose: () => void;
  onSave: () => void;
  allKnownCategories: string[];
  saving: boolean;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )
  const [newCat, setNewCat] = useState('')
  const [dest, setDest] = useState<'col1'|'col2'|'col3'>('col1')

  const getList = (l: 'col1'|'col2'|'col3'|'hidden'): string[] => l === 'col1' ? column1 : l === 'col2' ? column2 : l === 'col3' ? column3 : hiddenCats
  const setList = (l: 'col1'|'col2'|'col3'|'hidden', v: string[]) => {
    if (l === 'col1') onChangeColumn1(v)
    else if (l === 'col2') onChangeColumn2(v)
    else if (l === 'col3') onChangeColumn3(v)
    else onChangeHidden(v)
  }

  const findListAndIndex = (id: string): [('col1'|'col2'|'col3'|'hidden')|null, number] => {
    if (column1.includes(id)) return ['col1', column1.indexOf(id)]
    if (column2.includes(id)) return ['col2', column2.indexOf(id)]
    if (column3.includes(id)) return ['col3', column3.indexOf(id)]
    if (hiddenCats.includes(id)) return ['hidden', hiddenCats.indexOf(id)]
    return [null, -1]
  }

  const onDragEndAll = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return
    const activeId = String(active.id)
    const overId = String(over.id)

    const [fromList, fromIndex] = findListAndIndex(activeId)
    if (!fromList || fromIndex < 0) return

    // Determine destination container and index
    let toList: 'col1'|'col2'|'col3'|'hidden'
    let toIndex: number
    const isContainer = (id: string): id is 'col1'|'col2'|'col3'|'hidden' => (
      id === 'col1' || id === 'col2' || id === 'col3' || id === 'hidden'
    )

    if (isContainer(overId)) {
      toList = overId
      toIndex = getList(toList).length
    } else {
      const [detList, detIndex] = findListAndIndex(overId)
      if (!detList || detIndex < 0) return
      toList = detList
      toIndex = detIndex
    }

    if (fromList === toList) {
      const current = getList(fromList)
      setList(fromList, arrayMove(current, fromIndex, toIndex))
    } else {
      const source = [...getList(fromList)]
      const [moved] = source.splice(fromIndex, 1)
      const dest = [...getList(toList)]
      dest.splice(toIndex, 0, moved)
      setList(fromList, source)
      setList(toList, dest)
    }
  }

  const moveTo = (id: string, target: 'col1'|'col2'|'col3'|'hidden') => {
    // remove from all lists
    onChangeColumn1(column1.filter(c => c !== id))
    onChangeColumn2(column2.filter(c => c !== id))
    onChangeColumn3(column3.filter(c => c !== id))
    onChangeHidden(hiddenCats.filter(c => c !== id))
    // add to target
    if (target === 'col1') onChangeColumn1([...column1, id])
    else if (target === 'col2') onChangeColumn2([...column2, id])
    else if (target === 'col3') onChangeColumn3([...column3, id])
    else onChangeHidden([...hiddenCats, id])
  }

  const addCategory = () => {
    const name = newCat.trim()
    if (!name) return
    if ([...column1, ...column2, ...column3, ...hiddenCats].includes(name)) {
      setNewCat('')
      return
    }
    if (dest === 'col1') onChangeColumn1([...column1, name])
    if (dest === 'col2') onChangeColumn2([...column2, name])
    if (dest === 'col3') onChangeColumn3([...column3, name])
    setNewCat('')
  }

  const deleteCategory = (id: string) => {
    onChangeColumn1(column1.filter(c => c !== id))
    onChangeColumn2(column2.filter(c => c !== id))
    onChangeColumn3(column3.filter(c => c !== id))
    onChangeHidden(hiddenCats.filter(c => c !== id))
  }

  const ListBlock = ({ title, list, id, showMove, allowDelete }: { title: string; list: string[]; id: 'col1'|'col2'|'col3'|'hidden'; showMove?: boolean; allowDelete?: boolean }) => {
    const { setNodeRef } = useDroppable({ id })
    return (
    <div className="bg-white rounded-lg border border-gray-200 p-4" ref={setNodeRef}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <span className="text-xs text-gray-400">{list.length}</span>
      </div>
      <SortableContext items={list} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[40px]">
          {list.map((c) => (
            <SortableItem key={c} id={c} currentList={id} onMoveTo={showMove ? (t) => moveTo(c, t) : undefined} onDelete={allowDelete ? deleteCategory : undefined} />
          ))}
        </div>
      </SortableContext>
    </div>
  )}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-xl border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Manage Categories</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">×</button>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEndAll}>
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <ListBlock title="Column 1" list={column1} id="col1" showMove />
          <ListBlock title="Column 2" list={column2} id="col2" showMove />
          <ListBlock title="Column 3" list={column3} id="col3" showMove />
          <ListBlock title="Hidden" list={hiddenCats} id="hidden" allowDelete showMove />
        </div>
        </DndContext>

        <div className="px-4 pb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New category name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              list="all-categories"
            />
            <datalist id="all-categories">
              {allKnownCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <select value={dest} onChange={(e) => setDest(e.target.value as 'col1'|'col2'|'col3')} className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="col1">Column 1</option>
              <option value="col2">Column 2</option>
              <option value="col3">Column 3</option>
            </select>
            <button onClick={addCategory} className="bg-[#536C4A] text-white px-4 py-2 rounded-md hover:bg-[#536C4A]/90">Add</button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded-md bg-[#536C4A] text-white hover:bg-[#536C4A]/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}
