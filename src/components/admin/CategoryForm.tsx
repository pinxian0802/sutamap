'use client'

import { useState } from 'react'
import { useDictionary } from '@/lib/i18n/context'
import { Trash2 } from 'lucide-react'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

interface Props {
  category?: Category
  onSaved: (cat: Category) => void
  onCancel: () => void
  onDeleted?: () => void
}

export function CategoryForm({ category, onSaved, onCancel, onDeleted }: Props) {
  const dict = useDictionary()
  const isEdit = !!category

  const [name, setName] = useState(category?.name ?? '')
  const [nameEn, setNameEn] = useState(category?.name_en ?? '')
  const [nameZh, setNameZh] = useState(category?.name_zh ?? '')
  const [description, setDescription] = useState(category?.description ?? '')
  const [color, setColor] = useState(category?.color ?? '#7aa83c')
  const [icon, setIcon] = useState(category?.icon ?? '')
  const [checkinRadius, setCheckinRadius] = useState(category?.checkin_radius_meters ?? 500)
  const [xpPerCheckin, setXpPerCheckin] = useState(category?.xp_per_checkin ?? 100)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      name,
      name_en: nameEn,
      name_zh: nameZh,
      description,
      color,
      icon,
      checkin_radius_meters: checkinRadius,
      xp_per_checkin: xpPerCheckin,
    }

    try {
      const url = isEdit ? `/api/admin/categories/${category.id}` : '/api/admin/categories'
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      onSaved(data)
    } catch {
      alert(dict.admin.error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!category) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onDeleted?.()
    } catch {
      alert(dict.admin.error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="text-xs font-bold text-sub uppercase tracking-wider">
        {isEdit ? dict.admin.editCategory : dict.admin.addCategory}
      </div>

      <Field label={dict.admin.nameJa}>
        <input className="adm-input" value={name} onChange={e => setName(e.target.value)} required />
      </Field>
      <Field label={dict.admin.nameEn}>
        <input className="adm-input" value={nameEn} onChange={e => setNameEn(e.target.value)} required />
      </Field>
      <Field label={dict.admin.nameZh}>
        <input className="adm-input" value={nameZh} onChange={e => setNameZh(e.target.value)} required />
      </Field>
      <Field label={dict.admin.description}>
        <textarea className="adm-input min-h-[60px] resize-y" value={description} onChange={e => setDescription(e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label={dict.admin.color}>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-8 h-8 rounded-lg border border-line cursor-pointer" />
            <input className="adm-input flex-1" value={color} onChange={e => setColor(e.target.value)} />
          </div>
        </Field>
        <Field label={dict.admin.icon}>
          <input className="adm-input" value={icon} onChange={e => setIcon(e.target.value)} placeholder="🏔️" required />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={dict.admin.checkinRadius}>
          <input className="adm-input" type="number" value={checkinRadius} onChange={e => setCheckinRadius(Number(e.target.value))} min={10} required />
        </Field>
        <Field label={dict.admin.xpPerCheckin}>
          <input className="adm-input" type="number" value={xpPerCheckin} onChange={e => setXpPerCheckin(Number(e.target.value))} min={1} required />
        </Field>
      </div>

      <div className="flex gap-2 mt-1">
        <button type="submit" className="sm-btn sm-btn-primary flex-1 !py-2.5 !text-[13px]" disabled={saving}>
          {saving ? dict.admin.saving : dict.admin.save}
        </button>
        <button type="button" className="sm-btn sm-btn-ghost flex-1 !py-2.5 !text-[13px]" onClick={onCancel}>
          {dict.admin.cancel}
        </button>
      </div>

      {isEdit && onDeleted && (
        <div className="border-t border-line pt-3 mt-1">
          {confirmDelete ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-terra">{dict.admin.deleteConfirm}</p>
              <div className="flex gap-2">
                <button type="button" className="sm-btn !py-2 !text-[12px] flex-1 !bg-terra !text-white" onClick={handleDelete} disabled={saving}>
                  {dict.admin.deleteCategory}
                </button>
                <button type="button" className="sm-btn sm-btn-ghost !py-2 !text-[12px] flex-1" onClick={() => setConfirmDelete(false)}>
                  {dict.admin.cancel}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="flex items-center gap-1.5 text-xs text-terra hover:underline" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={13} />
              {dict.admin.deleteCategory}
            </button>
          )}
        </div>
      )}
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-bold text-sub">{label}</span>
      {children}
    </label>
  )
}
