'use client'

import { useState } from 'react'
import {
  CheckinV1Stamp, CheckinV2Float, CheckinV3Burst,
  CheckinV4CascadeDrop, CheckinV5NeonFlicker, CheckinV6ZoomFocus,
} from '@/components/animations/CheckinSuccessAnim'
import {
  LevelUpV1Ascend, LevelUpV2Surge, LevelUpV3Celestial,
  LevelUpV4OrbitRing, LevelUpV5Glitch, LevelUpV6ShatterRise,
} from '@/components/animations/LevelUpAnim'
import {
  TitleV1SealReveal, TitleV2RibbonUnfurl, TitleV3CrownDrop,
  TitleV4AncientScroll, TitleV5Gateway, TitleV6TypewriterFrame,
} from '@/components/animations/TitleUnlockAnim'

// ─── Replay-able card wrapper ─────────────────────────────────────────────────
function AnimCard({
  label,
  tag,
  children,
}: {
  label: string
  tag: string
  children: (replay: number) => React.ReactNode
}) {
  const [replay, setReplay] = useState(0)

  return (
    <div style={{
      background: 'var(--paper)',
      border: '1px solid var(--line)',
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 10px 28px -12px rgba(45,74,107,0.28)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px 10px',
        borderBottom: '1px solid var(--line2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{
            display: 'inline-block',
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.1em',
            color: 'var(--sub)', textTransform: 'uppercase',
            background: 'var(--paper2)', border: '1px solid var(--line)',
            borderRadius: 6, padding: '2px 8px', marginBottom: 3,
          }}>
            {tag}
          </span>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
            {label}
          </div>
        </div>
        <button
          onClick={() => setReplay(r => r + 1)}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 9,
            background: 'var(--tint)', border: '1px solid rgba(122,168,60,0.3)',
            color: 'var(--green-d)', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          ↺ 重播
        </button>
      </div>

      {/* Animation area */}
      <div style={{ background: 'var(--paper2)', flex: 1 }}>
        {children(replay)}
      </div>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'linear-gradient(135deg, var(--tint), var(--tint2))',
        border: '1px solid rgba(122,168,60,0.25)',
        display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--font-display)' }}>
          {title}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 2 }}>{desc}</div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnimationDemoPage() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '20px 16px 80px' }}>

      {/* Page title */}
      <div style={{ marginBottom: 28, paddingTop: 8 }}>
        <div style={{
          fontSize: 10.5, fontWeight: 700, letterSpacing: '0.12em',
          color: 'var(--sub)', textTransform: 'uppercase', marginBottom: 6,
        }}>
          Design Preview
        </div>
        <h1 style={{
          fontSize: 24, fontWeight: 900, color: 'var(--ink)',
          fontFamily: 'var(--font-display)', lineHeight: 1.2, marginBottom: 6,
        }}>
          動畫特效預覽
        </h1>
        <p style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.6 }}>
          每種事件各三款方案，點擊↺重播。選好後告訴我要採用哪一款。
        </p>
      </div>

      {/* ── 打卡成功 ── */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeader
          icon="✅"
          title="打卡成功"
          desc="首次到訪地點打卡後顯示"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimCard label="Stamp — 印章落地" tag="V1">
            {(r) => <CheckinV1Stamp replay={r} xp={30} locationName="山頂公園" />}
          </AnimCard>

          <AnimCard label="Float — 輕盈浮現 + XP 計數" tag="V2">
            {(r) => <CheckinV2Float replay={r} xp={30} locationName="山頂公園" />}
          </AnimCard>

          <AnimCard label="Burst — 粒子爆散" tag="V3">
            {(r) => <CheckinV3Burst replay={r} xp={30} locationName="山頂公園" />}
          </AnimCard>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 2px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--sub)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>新方案</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <AnimCard label="Cascade Drop — 高速俐落依序下落" tag="V4">
            {(r) => <CheckinV4CascadeDrop replay={r} xp={30} locationName="山頂公園" />}
          </AnimCard>
          <AnimCard label="Neon Flicker — 霓虹燈點亮效果" tag="V5">
            {(r) => <CheckinV5NeonFlicker replay={r} xp={30} locationName="山頂公園" />}
          </AnimCard>
          <AnimCard label="Zoom Focus — 鏡頭對焦拉近" tag="V6">
            {(r) => <CheckinV6ZoomFocus replay={r} xp={30} locationName="山頂公園" />}
          </AnimCard>
        </div>
      </section>

      {/* ── 升等 ── */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeader
          icon="⬆️"
          title="升等"
          desc="打卡後 XP 累積到達新等級"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimCard label="Ascend — 金色升騰，莊嚴感" tag="V1">
            {(r) => <LevelUpV1Ascend replay={r} prevLevel={5} level={6} />}
          </AnimCard>

          <AnimCard label="Surge — 白色衝擊波 + 震動爆發" tag="V2">
            {(r) => <LevelUpV2Surge replay={r} prevLevel={5} level={6} />}
          </AnimCard>

          <AnimCard label="Celestial — 星塵匯聚，宇宙旋轉" tag="V3">
            {(r) => <LevelUpV3Celestial replay={r} prevLevel={5} level={6} />}
          </AnimCard>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 2px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--sub)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>新方案</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <AnimCard label="Orbit Ring — SVG 進度環描繪，數字升起" tag="V4">
            {(r) => <LevelUpV4OrbitRing replay={r} prevLevel={5} level={6} />}
          </AnimCard>
          <AnimCard label="Glitch — RGB 分色干擾，數字 scramble" tag="V5">
            {(r) => <LevelUpV5Glitch replay={r} prevLevel={5} level={6} />}
          </AnimCard>
          <AnimCard label="Shatter & Rise — 碎片炸散，新等級升起" tag="V6">
            {(r) => <LevelUpV6ShatterRise replay={r} prevLevel={5} level={6} />}
          </AnimCard>
        </div>
      </section>

      {/* ── 解鎖稱號 ── */}
      <section style={{ marginBottom: 36 }}>
        <SectionHeader
          icon="🏆"
          title="解鎖稱號"
          desc="完成某類別全部打卡點後解鎖"
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <AnimCard label="Seal Reveal — SVG 封印描繪，光芒射出" tag="V1">
            {(r) => <TitleV1SealReveal replay={r} title="登山王" subtitle="完成所有山岳打卡" />}
          </AnimCard>

          <AnimCard label="Ribbon Unfurl — 金色橫幅展開，逐字入場" tag="V2">
            {(r) => <TitleV2RibbonUnfurl replay={r} title="登山王" subtitle="完成所有山岳打卡" />}
          </AnimCard>

          <AnimCard label="Crown Drop — 王冠跌落，粒子雨" tag="V3">
            {(r) => <TitleV3CrownDrop replay={r} title="登山王" subtitle="完成所有山岳打卡" />}
          </AnimCard>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 2px' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--sub)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>新方案</span>
            <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          </div>

          <AnimCard label="Ancient Scroll — 捲軸上下展開" tag="V4">
            {(r) => <TitleV4AncientScroll replay={r} title="登山王" subtitle="完成所有山岳打卡" />}
          </AnimCard>
          <AnimCard label="Gateway — 光門左右打開，稱號從縫中顯現" tag="V5">
            {(r) => <TitleV5Gateway replay={r} title="登山王" subtitle="完成所有山岳打卡" />}
          </AnimCard>
          <AnimCard label="Typewriter Frame — 四角邊框描繪，逐字打出" tag="V6">
            {(r) => <TitleV6TypewriterFrame replay={r} title="登山王" subtitle="完成所有山岳打卡" />}
          </AnimCard>
        </div>
      </section>

    </div>
  )
}
