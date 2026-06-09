'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

interface Props {
  replay?: number
  xp?: number
  locationName?: string
  xpBefore?: number
  xpMax?: number
  prevLevel?: number
  level?: number
  photoUrl?: string
}

export function CheckinLevelUpFlow({
  replay = 0,
  xp = 30,
  locationName = '山頂公園',
  xpBefore = 75,
  xpMax = 100,
  prevLevel = 5,
  level = 6,
}: Props) {
  const root = useRef<HTMLDivElement>(null)

  // ── Checkin refs ──
  const checkinLayerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const xpBadgeRef = useRef<HTMLDivElement>(null)
  const xpNumRef = useRef<HTMLSpanElement>(null)
  const barWrapRef = useRef<HTMLDivElement>(null)
  const barFillRef = useRef<HTMLDivElement>(null)

  // ── Level-up refs ──
  const levelupLayerRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const lvNumRef = useRef<HTMLDivElement>(null)
  const lvLabelRef = useRef<HTMLDivElement>(null)
  const ring1Ref = useRef<HTMLDivElement>(null)
  const ring2Ref = useRef<HTMLDivElement>(null)
  const ring3Ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const startPct = Math.min(xpBefore / xpMax, 1)

    // ── Initial states ──
    gsap.set(checkinLayerRef.current, { opacity: 1, scale: 1 })
    gsap.set(levelupLayerRef.current, { opacity: 0 })
    gsap.set(iconRef.current, { scale: 0, rotation: -14 })
    gsap.set([titleRef.current, subRef.current], { opacity: 0, y: 12 })
    gsap.set(xpBadgeRef.current, { scale: 0, opacity: 0, y: 8 })
    gsap.set(barWrapRef.current, { opacity: 0, y: 8 })
    gsap.set(barFillRef.current, { width: `${startPct * 100}%` })
    gsap.set(flashRef.current, { opacity: 0 })
    gsap.set(lvNumRef.current, { scale: 0.35, opacity: 0, y: 20 })
    gsap.set(lvLabelRef.current, { opacity: 0, y: 10 })
    gsap.set([ring1Ref.current, ring2Ref.current, ring3Ref.current], { scale: 0, opacity: 0.85 })
    if (xpNumRef.current) xpNumRef.current.textContent = '0'

    // ── Phase 1: Checkin ──
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      .to(iconRef.current, { scale: 1, rotation: 0, ease: 'elastic.out(1, 0.42)', duration: 0.88 })
      .to(titleRef.current, { y: 0, opacity: 1, duration: 0.36 }, '<0.26')
      .to(subRef.current, { y: 0, opacity: 1, duration: 0.3 }, '<0.08')
      .to(barWrapRef.current, { opacity: 1, y: 0, duration: 0.32 }, '<0.18')
      .to(xpBadgeRef.current, { scale: 1, y: 0, opacity: 1, ease: 'back.out(2)', duration: 0.42 }, '<')
      .call(() => {
        const counter = { val: 0 }
        gsap.to(counter, {
          val: xp,
          duration: 1.0,
          ease: 'power2.out',
          onUpdate() {
            const v = Math.round(counter.val)
            if (xpNumRef.current) xpNumRef.current.textContent = String(v)
            const pct = Math.min((xpBefore + v) / xpMax, 1)
            if (barFillRef.current) barFillRef.current.style.width = `${pct * 100}%`
          },
          onComplete: triggerLevelUp,
        })
      })

    // ── Phase 2: Transition + Level-up ──
    function triggerLevelUp() {
      // 直接縮出，不閃爍
      gsap.to(checkinLayerRef.current, {
        opacity: 0, scale: 0.86, duration: 0.32, ease: 'power2.in',
        onComplete: playLevelUp,
      })
    }

    function playLevelUp() {
      gsap.set(levelupLayerRef.current, { opacity: 1 })
      if (lvNumRef.current) lvNumRef.current.textContent = String(level)

      const ltl = gsap.timeline()

      // 白色閃光
      ltl
        .to(flashRef.current, { opacity: 1, duration: 0.07 })
        .to(flashRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })

      // 數字爆出
      ltl.fromTo(lvNumRef.current,
        { scale: 0.35, opacity: 0, y: 20 },
        { scale: 1.55, opacity: 1, duration: 0.26, ease: 'power4.out' },
        '<0.05'
      )
      ltl.to(lvNumRef.current, { scale: 1, duration: 0.2, ease: 'power3.out' })

      // 震動
      ltl.to(lvNumRef.current, {
        keyframes: [
          { x: -5, duration: 0.05 },
          { x: 5, duration: 0.05 },
          { x: -4, duration: 0.05 },
          { x: 4, duration: 0.05 },
          { x: 0, duration: 0.05 },
        ],
      })

      // 能量環
      ltl.to([ring1Ref.current, ring2Ref.current, ring3Ref.current], {
        scale: 3, opacity: 0, duration: 0.72, ease: 'power2.out', stagger: 0.13,
      }, '<-0.15')

      // 副標
      ltl.to(lvLabelRef.current, { opacity: 1, y: 0, duration: 0.35 }, '<0.2')
    }

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} style={{ position: 'relative', minHeight: 290, overflow: 'hidden' }}>

      {/* ── Checkin layer ── */}
      <div ref={checkinLayerRef} className="flex flex-col items-center py-8 px-6">
        <div ref={iconRef} style={{
          fontSize: 52, lineHeight: 1, marginBottom: 12,
          filter: 'drop-shadow(0 4px 12px rgba(122,168,60,0.3))',
        }}>
          ⛰️
        </div>
        <div ref={titleRef} style={{
          fontSize: 21, fontWeight: 700, color: 'var(--ink)',
          fontFamily: 'var(--font-display)', marginBottom: 5,
        }}>
          打卡成功！
        </div>
        <div ref={subRef} style={{ fontSize: 13.5, color: 'var(--sub)' }}>
          {locationName} ・ 第一次到訪
        </div>
        <div ref={xpBadgeRef} style={{
          marginTop: 20,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 22px', borderRadius: 14,
          background: 'var(--tint)', color: 'var(--green-d)',
          fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)',
          boxShadow: '0 6px 18px -6px rgba(122,168,60,0.35)',
        }}>
          ⚡ +<span ref={xpNumRef}>0</span> XP
        </div>

        {/* XP bar */}
        <div ref={barWrapRef} style={{ width: '100%', maxWidth: 280, marginTop: 14 }}>
          <div style={{
            height: 7, borderRadius: 99,
            background: 'rgba(122,168,60,0.15)', overflow: 'hidden',
          }}>
            <div ref={barFillRef} style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, var(--green), #a8cc5c)',
              boxShadow: '0 0 8px rgba(122,168,60,0.5)',
              width: '0%',
            }} />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            marginTop: 5, fontSize: 11, color: 'var(--sub)', fontWeight: 600,
          }}>
            <span>Lv. 經驗值</span>
            <span>{Math.min(xpBefore + xp, xpMax)} / {xpMax}</span>
          </div>
        </div>
      </div>

      {/* ── Level-up layer ── */}
      <div ref={levelupLayerRef} style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #1a2a42 0%, #0d1a2e 100%)',
      }}>
        {/* Flash */}
        <div ref={flashRef} style={{
          position: 'absolute', inset: 0,
          background: 'white', pointerEvents: 'none',
        }} />

        {/* Energy rings */}
        <div ref={ring1Ref} style={{
          position: 'absolute', width: 110, height: 110, borderRadius: '50%',
          border: '1.5px solid rgba(207,154,62,0.7)', pointerEvents: 'none',
        }} />
        <div ref={ring2Ref} style={{
          position: 'absolute', width: 110, height: 110, borderRadius: '50%',
          border: '1.2px solid rgba(207,154,62,0.5)', pointerEvents: 'none',
        }} />
        <div ref={ring3Ref} style={{
          position: 'absolute', width: 110, height: 110, borderRadius: '50%',
          border: '1px solid rgba(207,154,62,0.35)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            fontSize: 11.5, fontWeight: 700, letterSpacing: '0.2em',
            color: 'rgba(207,154,62,0.65)', marginBottom: 6, textTransform: 'uppercase',
          }}>
            Level Up
          </div>
          <div ref={lvNumRef} style={{
            fontSize: 82, fontWeight: 900, lineHeight: 1,
            color: '#f0c040', fontFamily: 'var(--font-display)',
            textShadow: '0 0 36px rgba(207,154,62,0.55)',
          }}>
            {level}
          </div>
          <div ref={lvLabelRef} style={{
            fontSize: 13.5, color: 'rgba(240,192,64,0.72)', marginTop: 10,
          }}>
            新等級解鎖！
          </div>
        </div>
      </div>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CheckinLevelUpPause
// bar 跑到 100% → 升等動畫蓋上（打卡畫面保留）→ 按確認 → bar 從 0 跑溢出經驗
// ─────────────────────────────────────────────────────────────────────────────
export function CheckinLevelUpPause({
  replay = 0,
  xp = 30,
  locationName = '山頂公園',
  xpBefore = 80,
  xpMax = 100,
  prevLevel = 5,
  level = 6,
  photoUrl,
}: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const overflowFnRef = useRef<(() => void) | null>(null)

  // Checkin refs
  const photoRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const xpBadgeRef = useRef<HTMLDivElement>(null)
  const xpNumRef = useRef<HTMLSpanElement>(null)
  const barWrapRef = useRef<HTMLDivElement>(null)
  const barFillRef = useRef<HTMLDivElement>(null)
  const barNumRef = useRef<HTMLSpanElement>(null)

  // Level-up overlay refs
  const overlayRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const lvNumRef = useRef<HTMLDivElement>(null)
  const lvLabelRef = useRef<HTMLDivElement>(null)
  const ringContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    setShowConfirm(false)
    const levelUpPoint = Math.max(0, xpMax - xpBefore)
    const overflow = Math.max(0, xp - levelUpPoint)
    const startPct = xpBefore / xpMax

    // ── Initial states ──
    gsap.set(photoRef.current, { scale: 0, opacity: 0 })
    gsap.set([titleRef.current, subRef.current], { opacity: 0, y: 12 })
    gsap.set(xpBadgeRef.current, { scale: 0, opacity: 0, y: 8 })
    gsap.set(barWrapRef.current, { opacity: 0, y: 8 })
    gsap.set(barFillRef.current, { width: `${startPct * 100}%` })
    gsap.set(overlayRef.current, { opacity: 0, pointerEvents: 'none' })
    if (xpNumRef.current) xpNumRef.current.textContent = '0'

    // ── Phase 1: Checkin ──
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl
      .to(photoRef.current, { scale: 1, opacity: 1, ease: 'elastic.out(1, 0.42)', duration: 0.88 })
      .to(titleRef.current, { y: 0, opacity: 1, duration: 0.36 }, '<0.26')
      .to(subRef.current, { y: 0, opacity: 1, duration: 0.3 }, '<0.08')
      .to(barWrapRef.current, { opacity: 1, y: 0, duration: 0.32 }, '<0.18')
      .to(xpBadgeRef.current, { scale: 1, y: 0, opacity: 1, ease: 'back.out(2)', duration: 0.42 }, '<')
      .call(() => {
        const c1 = { val: 0 }
        gsap.to(c1, {
          val: levelUpPoint,
          duration: (levelUpPoint / xp) * 1.0,
          ease: 'power2.out',
          onUpdate() {
            const v = Math.round(c1.val)
            if (xpNumRef.current) xpNumRef.current.textContent = String(v)
            const total = Math.min(xpBefore + v, xpMax)
            const pct = total / xpMax
            if (barFillRef.current) barFillRef.current.style.width = `${pct * 100}%`
            if (barNumRef.current) barNumRef.current.textContent = `${total} / ${xpMax}`
          },
          onComplete() { gsap.delayedCall(0.1, showLevelUpOverlay) },
        })

        function showLevelUpOverlay() {
          // 建立動態 rings（V2 Surge 原版）
          const ringCon = ringContainerRef.current!
          ringCon.innerHTML = ''
          const rings = Array.from({ length: 3 }, (_, i) => {
            const r = document.createElement('div')
            r.style.cssText = `
              position:absolute; top:50%; left:50%;
              width:96px; height:96px;
              margin:-48px 0 0 -48px;
              border-radius:50%;
              border:2px solid rgba(207,154,62,${0.7 - i * 0.15});
              pointer-events:none;
            `
            ringCon.appendChild(r)
            return r
          })

          // V2 Surge 初始狀態
          gsap.set(overlayRef.current, { opacity: 0, pointerEvents: 'auto' })
          gsap.set(flashRef.current, { opacity: 0 })
          gsap.set(lvNumRef.current, { scale: 1, opacity: 0 })
          if (lvNumRef.current) lvNumRef.current.textContent = String(prevLevel)
          gsap.set(lvLabelRef.current, { opacity: 0, y: 10 })
          gsap.set(rings, { scale: 0.5, opacity: 0 })

          // V2 Surge timeline（原版完整複製）
          const ltl = gsap.timeline()
          ltl
            .to(overlayRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' })
            .to(lvNumRef.current, { opacity: 1, duration: 0.28 }, '<0.1')
            .to(lvNumRef.current, { scale: 0.35, duration: 0.26, ease: 'power4.in' }, '+=0.12')
            .to(flashRef.current, { opacity: 1, duration: 0.08 }, '+=0')
            .to(flashRef.current, { opacity: 0, duration: 0.32, ease: 'power3.out' })
            .to(lvNumRef.current, {
              scale: 1.55, duration: 0.32, ease: 'power4.out',
              onStart() { if (lvNumRef.current) lvNumRef.current.textContent = String(level) },
            }, '<')
            .to(lvNumRef.current, { x: -6, duration: 0.06 }, '<0.08')
            .to(lvNumRef.current, { x: 6, duration: 0.06 })
            .to(lvNumRef.current, { x: -4, duration: 0.06 })
            .to(lvNumRef.current, { x: 4, duration: 0.06 })
            .to(lvNumRef.current, { x: 0, duration: 0.06 })
            .to(lvNumRef.current, { scale: 1, duration: 0.62, ease: 'back.out(2)' }, '<0.05')
            .to(rings, { scale: 3.5, opacity: 0, duration: 1.0, ease: 'power2.out', stagger: 0.14 }, '<-0.75')
            .to(lvLabelRef.current, { opacity: 1, y: 0, duration: 0.48, ease: 'power3.out' }, '<0.35')
            .to(lvNumRef.current, {
              textShadow: '0 0 32px rgba(207,154,62,1), 0 0 64px rgba(207,154,62,0.5)',
              duration: 0.5, ease: 'power2.inOut', yoyo: true, repeat: 1,
            }, '<-0.1')
            .call(() => setShowConfirm(true))

          overflowFnRef.current = () => {
            gsap.to(overlayRef.current, {
              opacity: 0, pointerEvents: 'none', duration: 0.3, ease: 'power2.in',
              onComplete() {
                setShowConfirm(false)
                if (overflow <= 0) return
                gsap.set(barFillRef.current, { width: '0%' })
                if (xpNumRef.current) xpNumRef.current.textContent = '0'
                if (barNumRef.current) barNumRef.current.textContent = `0 / ${xpMax}`
                const oc = { val: 0 }
                gsap.to(oc, {
                  val: overflow,
                  duration: 0.8,
                  ease: 'power2.out',
                  onUpdate() {
                    const v = Math.round(oc.val)
                    if (xpNumRef.current) xpNumRef.current.textContent = String(v)
                    if (barFillRef.current) barFillRef.current.style.width = `${(v / xpMax) * 100}%`
                    if (barNumRef.current) barNumRef.current.textContent = `${v} / ${xpMax}`
                  },
                })
              },
            })
          }
        }
      })

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  function handleConfirm() {
    overflowFnRef.current?.()
  }

  return (
    <div ref={root} style={{ position: 'relative', minHeight: 290, overflow: 'hidden' }}>

      {/* ── Checkin layer（保留不收） ── */}
      <div className="flex flex-col items-center pb-8 px-6">
        <div ref={photoRef} style={{
          width: 220, height: 220, borderRadius: 16, overflow: 'hidden',
          marginBottom: 12, background: 'var(--paper2)',
          boxShadow: '0 4px 16px -4px rgba(0,0,0,0.18)',
          flexShrink: 0,
        }}>
          {photoUrl
            ? <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            : <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 40 }}>⛰️</div>
          }
        </div>
        <div ref={titleRef} style={{ fontSize: 21, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 5 }}>
          打卡成功！
        </div>
        <div ref={subRef} style={{ fontSize: 13.5, color: 'var(--sub)' }}>
          {locationName} ・ 第一次到訪
        </div>
        <div ref={xpBadgeRef} style={{
          marginTop: 20,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 22px', borderRadius: 14,
          background: 'var(--tint)', color: 'var(--green-d)',
          fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)',
          boxShadow: '0 6px 18px -6px rgba(122,168,60,0.35)',
        }}>
          ⚡ +<span ref={xpNumRef}>0</span> XP
        </div>
        <div ref={barWrapRef} style={{ width: '100%', maxWidth: 280, marginTop: 14 }}>
          <div style={{ height: 7, borderRadius: 99, background: 'rgba(122,168,60,0.15)', overflow: 'hidden' }}>
            <div ref={barFillRef} style={{
              height: '100%', borderRadius: 99,
              background: 'linear-gradient(90deg, var(--green), #a8cc5c)',
              boxShadow: '0 0 8px rgba(122,168,60,0.5)',
              width: '0%',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: 11, color: 'var(--sub)', fontWeight: 600 }}>
            <span>Lv. 經驗值</span>
            <span ref={barNumRef}>{xpBefore} / {xpMax}</span>
          </div>
        </div>
      </div>

      {/* ── Level-up overlay（V2 Surge，全螢幕蓋上） ── */}
      <div ref={overlayRef} onClick={handleConfirm} style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, rgba(14,20,36,0.97), rgba(24,34,58,0.99))',
        cursor: 'pointer',
      }}>
        <div ref={flashRef} style={{ position: 'absolute', inset: 0, background: 'white', pointerEvents: 'none', zIndex: 5 }} />
        <div ref={ringContainerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 4, textAlign: 'center' }}>
          <div ref={lvNumRef} style={{
            fontSize: 76, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: '#e8b84b', lineHeight: 1,
            textShadow: '0 4px 16px rgba(207,154,62,0.3)',
          }}>
            {prevLevel}
          </div>
          <div ref={lvLabelRef} style={{
            fontSize: 11, fontWeight: 800, color: '#cf9a3e',
            letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 8,
          }}>
            Level Up
          </div>
        </div>

        {showConfirm && (
          <div style={{
            position: 'absolute', bottom: 20, left: 0, right: 0,
            textAlign: 'center',
            fontSize: 11.5, color: 'rgba(240,192,64,0.4)',
            letterSpacing: '0.08em',
          }}>
            點擊關閉
          </div>
        )}
      </div>

    </div>
  )
}
