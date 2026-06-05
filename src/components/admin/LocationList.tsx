'use client'

import { useState } from 'react'
import { useDictionary } from '@/lib/i18n/context'
import { Plus, Trash2, MapPin } from 'lucide-react'
import type { Database } from '@/types/database'

type Location = Database['public']['Tables']['locations']['Row']

interface Props {
  categoryId: string
  locations: Location[]
  onSaved: (loc: Location, isNew: boolean) => void
  onDeleted: (id: string) => void
}

export function LocationList({ categoryId, locations, onSaved, onDeleted }: Props) {
  const dict = useDictionary()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-bold text-sub uppercase tracking-wider">
        {dict.admin.locations}
      </div>

      {locations.length === 0 && (
        <p className="text-xs text-sub py-2 text-center">{dict.admin.noLocations}</p>
      )}

      {locations.map(loc => (
        <div key={loc.id} className="rounded-lg border border-line2 overflow-hidden">
          {editingId === loc.id ? (
            <div className="p-2.5">
              <LocationForm
                categoryId={categoryId}
                location={loc}
                onSaved={l => { onSaved(l, false); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
                onDeleted={() => { onDeleted(loc.id); setEditingId(null) }}
              />
            </div>
          ) : (
            <button
              className="w-full flex items-center gap-2.5 p-2.5 text-left hover:bg-paper2 transition-colors"
              onClick={() => setEditingId(loc.id)}
            >
              <MapPin size={14} className="text-sub flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-ink truncate">{loc.name}</div>
                {loc.prefecture && <div className="text-[10px] text-sub">{loc.prefecture}</div>}
              </div>
              {!loc.is_active && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-paper2 text-sub border border-line">OFF</span>
              )}
            </button>
          )}
        </div>
      ))}

      {showAdd ? (
        <div className="rounded-lg border border-line2 p-2.5">
          <LocationForm
            categoryId={categoryId}
            onSaved={l => { onSaved(l, true); setShowAdd(false) }}
            onCancel={() => setShowAdd(false)}
          />
        </div>
      ) : (
        <button
          className="flex items-center justify-center gap-1.5 text-xs font-bold text-green-d py-2 hover:underline"
          onClick={() => setShowAdd(true)}
        >
          <Plus size={14} />
          {dict.admin.addLocation}
        </button>
      )}
    </div>
  )
}

function LocationForm({
  categoryId,
  location,
  onSaved,
  onCancel,
  onDeleted,
}: {
  categoryId: string
  location?: Location
  onSaved: (loc: Location) => void
  onCancel: () => void
  onDeleted?: () => void
}) {
  const dict = useDictionary()
  const isEdit = !!location

  const [name, setName] = useState(location?.name ?? '')
  const [nameEn, setNameEn] = useState(location?.name_en ?? '')
  const [nameZh, setNameZh] = useState(location?.name_zh ?? '')
  const [prefecture, setPrefecture] = useState(location?.prefecture ?? '')
  const [lat, setLat] = useState(location?.lat ?? 0)
  const [lng, setLng] = useState(location?.lng ?? 0)
  const [isActive, setIsActive] = useState(location?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      category_id: categoryId,
      name,
      name_en: nameEn,
      name_zh: nameZh,
      prefecture,
      lat,
      lng,
      is_active: isActive,
    }

    try {
      const url = isEdit ? `/api/admin/locations/${location.id}` : '/api/admin/locations'
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
    if (!location) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/locations/${location.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      onDeleted?.()
    } catch {
      alert(dict.admin.error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="text-[10px] font-bold text-sub uppercase tracking-wider">
        {isEdit ? dict.admin.editLocation : dict.admin.addLocation}
      </div>

      <Field label={dict.admin.locationName}>
        <input className="adm-input !text-xs" value={name} onChange={e => setName(e.target.value)} required />
      </Field>
      <Field label={dict.admin.locationNameEn}>
        <input className="adm-input !text-xs" value={nameEn} onChange={e => setNameEn(e.target.value)} />
      </Field>
      <Field label={dict.admin.locationNameZh}>
        <input className="adm-input !text-xs" value={nameZh} onChange={e => setNameZh(e.target.value)} />
      </Field>
      <Field label={dict.admin.prefecture}>
        <input className="adm-input !text-xs" value={prefecture} onChange={e => setPrefecture(e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <Field label={dict.admin.lat}>
          <input className="adm-input !text-xs" type="number" step="any" value={lat} onChange={e => setLat(Number(e.target.value))} required />
        </Field>
        <Field label={dict.admin.lng}>
          <input className="adm-input !text-xs" type="number" step="any" value={lng} onChange={e => setLng(Number(e.target.value))} required />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-xs text-ink">
        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded" />
        {dict.admin.active}
      </label>

      <div className="flex gap-2">
        <button type="submit" className="sm-btn sm-btn-primary flex-1 !py-2 !text-[12px]" disabled={saving}>
          {saving ? dict.admin.saving : dict.admin.save}
        </button>
        <button type="button" className="sm-btn sm-btn-ghost flex-1 !py-2 !text-[12px]" onClick={onCancel}>
          {dict.admin.cancel}
        </button>
      </div>

      {isEdit && onDeleted && (
        confirmDelete ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] text-terra">{dict.admin.deleteLocationConfirm}</p>
            <div className="flex gap-2">
              <button type="button" className="sm-btn !py-1.5 !text-[11px] flex-1 !bg-terra !text-white" onClick={handleDelete} disabled={saving}>
                {dict.admin.deleteLocation}
              </button>
              <button type="button" className="sm-btn sm-btn-ghost !py-1.5 !text-[11px] flex-1" onClick={() => setConfirmDelete(false)}>
                {dict.admin.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="flex items-center gap-1 text-[11px] text-terra hover:underline" onClick={() => setConfirmDelete(true)}>
            <Trash2 size={11} />
            {dict.admin.deleteLocation}
          </button>
        )
      )}
    </form>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-sub">{label}</span>
      {children}
    </label>
  )
}
