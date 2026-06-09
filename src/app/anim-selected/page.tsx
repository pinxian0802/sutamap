'use client'

import { useState } from 'react'
import { CheckinV1Stamp } from '@/components/animations/CheckinSuccessAnim'
import { CheckinLevelUpPause } from '@/components/animations/CheckinLevelUpFlow'

function ReplayCard({ label, children }: { label: string; children: (r: number) => React.ReactNode }) {
  const [replay, setReplay] = useState(0)
  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 20,
      overflow: 'hidden',
      boxShadow: '0 12px 32px -14px rgba(45,74,107,0.22)',
    }}>
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: '1px solid var(--line2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: 'var(--ink)',
          fontFamily: 'var(--font-display)',
        }}>
          {label}
        </span>
        <button
          onClick={() => setReplay(r => r + 1)}
          style={{
            padding: '5px 13px', borderRadius: 8,
            background: 'var(--tint)', border: '1px solid rgba(122,168,60,0.3)',
            color: 'var(--green-d)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          ↺ 重播
        </button>
      </div>
      <div style={{ background: 'var(--paper2)' }}>
        {children(replay)}
      </div>
    </div>
  )
}

export default function AnimSelectedPage() {
  return (
    <div style={{ maxWidth: 440, margin: '0 auto', padding: '24px 16px 80px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--sub)', textTransform: 'uppercase', marginBottom: 6,
        }}>
          已選定方案
        </div>
        <h1 style={{
          fontSize: 22, fontWeight: 900, color: 'var(--ink)',
          fontFamily: 'var(--font-display)', lineHeight: 1.2,
        }}>
          動畫選定預覽
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 打卡成功 V1 */}
        <ReplayCard label="打卡成功 · V1 Stamp">
          {(r) => <CheckinV1Stamp replay={r} xp={30} locationName="山頂公園" xpBefore={60} xpMax={100} />}
        </ReplayCard>

        {/* 打卡 → 升等（蓋上版） */}
        <ReplayCard label="打卡成功 → 升等 · 升等蓋上，確認後繼續">
          {(r) => <CheckinLevelUpPause replay={r} xp={30} locationName="山頂公園" xpBefore={80} xpMax={100} prevLevel={5} level={6} />}
        </ReplayCard>

        {/* 稱號 — 待定 */}
        <div style={{
          border: '2px dashed var(--line)',
          borderRadius: 20,
          padding: '32px 16px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🏆</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--sub)', fontFamily: 'var(--font-display)' }}>
            解鎖稱號 · 待選定
          </div>
          <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 4 }}>
            請至 /animation-demo 比較後告訴我要哪個方案
          </div>
        </div>

      </div>
    </div>
  )
}
