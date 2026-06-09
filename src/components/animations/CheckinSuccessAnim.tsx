'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

interface BaseProps {
  replay?: number
  xp?: number
  locationName?: string
  xpBefore?: number
  xpMax?: number
  photoUrl?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// V1: STAMP — 用力蓋章，踏實感
// 卡片以印章動作落地，ripple 向外擴散，icon 彈跳，XP badge 彈入
// ─────────────────────────────────────────────────────────────────────────────
export function CheckinV1Stamp({ replay = 0, xp = 30, locationName = '山頂公園', xpBefore = 60, xpMax = 100, photoUrl }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const photoRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)
  const xpNumRef = useRef<HTMLSpanElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const barWrapRef = useRef<HTMLDivElement>(null)
  const barFillRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const startPct = Math.min(xpBefore / xpMax, 1)

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    gsap.set(root.current, { scale: 0.82, y: 18, opacity: 0 })
    gsap.set(ringRef.current, { scale: 0.3, opacity: 0.55 })
    gsap.set(photoRef.current, { scale: 0, opacity: 0 })
    gsap.set([titleRef.current, subRef.current], { opacity: 0, y: 12 })
    gsap.set(xpRef.current, { scale: 0, opacity: 0, y: 8 })
    gsap.set(barWrapRef.current, { opacity: 0, y: 8 })
    gsap.set(barFillRef.current, { width: `${startPct * 100}%` })
    if (xpNumRef.current) xpNumRef.current.textContent = '0'

    tl
      .to(root.current, { scale: 1, y: 0, opacity: 1, ease: 'back.out(2.2)', duration: 0.44 })
      .to(ringRef.current, { scale: 2.8, opacity: 0, duration: 0.65, ease: 'power2.out' }, '<')
      .to(photoRef.current, { scale: 1, opacity: 1, ease: 'elastic.out(1, 0.42)', duration: 0.88 }, '<0.06')
      .to(titleRef.current, { y: 0, opacity: 1, duration: 0.36 }, '<0.26')
      .to(subRef.current, { y: 0, opacity: 1, duration: 0.3 }, '<0.08')
      .to(barWrapRef.current, { opacity: 1, y: 0, duration: 0.32 }, '<0.18')
      .to(xpRef.current, { scale: 1, y: 0, opacity: 1, ease: 'back.out(2)', duration: 0.42 }, '<')
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
        })
      })

  }, { scope: root, dependencies: [replay, xpBefore, xpMax], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center pb-8 px-6" style={{ minHeight: 240 }}>
      {/* Ripple ring */}
      <div ref={ringRef} className="absolute pointer-events-none" style={{
        top: '50%', left: '50%',
        width: 148, height: 148,
        marginTop: -74, marginLeft: -74,
        borderRadius: '50%',
        border: '1.5px solid var(--green)',
      }} />

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
      <div ref={titleRef} className="font-bold" style={{ fontSize: 21, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 5 }}>
        打卡成功！
      </div>
      <div ref={subRef} style={{ fontSize: 13.5, color: 'var(--sub)' }}>
        {locationName} ・ 第一次到訪
      </div>
      <div ref={xpRef} style={{
        marginTop: 20,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 22px', borderRadius: 14,
        background: 'var(--tint)', color: 'var(--green-d)',
        fontWeight: 700, fontSize: 18,
        fontFamily: 'var(--font-display)',
        boxShadow: '0 6px 18px -6px rgba(122,168,60,0.35)',
      }}>
        ⚡ +<span ref={xpNumRef}>0</span> XP
      </div>

      {/* XP progress bar */}
      <div ref={barWrapRef} style={{ width: '100%', maxWidth: 280, marginTop: 14 }}>
        <div style={{
          height: 7, borderRadius: 99,
          background: 'rgba(122,168,60,0.15)',
          overflow: 'hidden',
        }}>
          <div ref={barFillRef} style={{
            height: '100%',
            borderRadius: 99,
            background: 'linear-gradient(90deg, var(--green), #a8cc5c)',
            boxShadow: '0 0 8px rgba(122,168,60,0.5)',
            width: '0%',
            transition: 'none',
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
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V2: FLOAT — 輕盈從下方浮現，XP 數字從 0 計數上來
// ─────────────────────────────────────────────────────────────────────────────
export function CheckinV2Float({ replay = 0, xp = 30, locationName = '山頂公園' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)
  const xpNumRef = useRef<HTMLSpanElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.set(glowRef.current, { opacity: 0, scale: 0.7 })
    gsap.set(iconRef.current, { y: 42, opacity: 0 })
    gsap.set(titleRef.current, { y: 26, opacity: 0 })
    gsap.set(subRef.current, { y: 18, opacity: 0 })
    gsap.set(xpRef.current, { y: 18, opacity: 0 })

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })

    tl
      .to(glowRef.current, { opacity: 1, scale: 1, duration: 0.7, ease: 'power2.out' })
      .to(iconRef.current, { y: 0, opacity: 1, duration: 0.55 }, '<')
      .to(titleRef.current, { y: 0, opacity: 1, duration: 0.48 }, '<0.1')
      .to(subRef.current, { y: 0, opacity: 1, duration: 0.4 }, '<0.09')
      .to(xpRef.current, { y: 0, opacity: 1, duration: 0.44, ease: 'power3.out' }, '<0.1')

    // XP counter
    const counter = { val: 0 }
    gsap.to(counter, {
      val: xp,
      duration: 0.72,
      delay: 0.42,
      ease: 'power3.out',
      onUpdate() {
        if (xpNumRef.current) xpNumRef.current.textContent = String(Math.round(counter.val))
      },
    })

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center py-8 px-6" style={{ minHeight: 220 }}>
      {/* Background glow */}
      <div ref={glowRef} className="absolute pointer-events-none" style={{
        top: '40%', left: '50%',
        width: 180, height: 180,
        transform: 'translate(-50%,-50%)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(122,168,60,0.12) 0%, transparent 70%)',
      }} />

      <div ref={iconRef} style={{ fontSize: 52, lineHeight: 1, marginBottom: 12 }}>⛰️</div>
      <div ref={titleRef} className="font-bold" style={{ fontSize: 21, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 5 }}>
        打卡成功！
      </div>
      <div ref={subRef} style={{ fontSize: 13.5, color: 'var(--sub)' }}>
        {locationName} ・ 第一次到訪
      </div>
      <div ref={xpRef} style={{
        marginTop: 20,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 22px', borderRadius: 14,
        background: 'var(--tint)', color: 'var(--green-d)',
        fontWeight: 700, fontSize: 18,
        fontFamily: 'var(--font-display)',
      }}>
        ⚡ +<span ref={xpNumRef}>0</span> XP
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V3: BURST — 閃光 + 粒子爆散，icon 衝出
// ─────────────────────────────────────────────────────────────────────────────
export function CheckinV3Burst({ replay = 0, xp = 30, locationName = '山頂公園' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const particleContainerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const pCon = particleContainerRef.current!
    pCon.innerHTML = ''

    const palette = ['#7aa83c', '#cf9a3e', '#4f8db5', '#c0563f', '#6c9a34', '#a0c460']
    const particles = Array.from({ length: 14 }, (_, i) => {
      const p = document.createElement('div')
      const sz = 4 + (i % 3) * 2.5
      p.style.cssText = `
        position:absolute; top:50%; left:50%;
        width:${sz}px; height:${sz}px;
        border-radius:50%;
        background:${palette[i % palette.length]};
        transform:translate(-50%,-50%);
      `
      pCon.appendChild(p)
      return p
    })

    gsap.set(flashRef.current, { opacity: 0 })
    gsap.set(iconRef.current, { scale: 0 })
    gsap.set(contentRef.current, { y: 22, opacity: 0 })
    gsap.set(xpRef.current, { scale: 0, opacity: 0 })
    gsap.set(particles, { x: 0, y: 0, opacity: 1 })

    const tl = gsap.timeline()

    tl
      // Flash
      .to(flashRef.current, { opacity: 0.78, duration: 0.07 })
      .to(flashRef.current, { opacity: 0, duration: 0.22, ease: 'power2.out' })

      // Particles radiate outward
      .to(particles, {
        x: (i) => Math.cos((i / 14) * Math.PI * 2) * (55 + (i % 3) * 22),
        y: (i) => Math.sin((i / 14) * Math.PI * 2) * (55 + (i % 3) * 22),
        opacity: 0,
        duration: 0.72,
        ease: 'power3.out',
        stagger: 0.022,
      }, '<0.06')

      // Icon bursts in
      .fromTo(iconRef.current,
        { scale: 0 },
        { scale: 1.28, duration: 0.26, ease: 'power4.out' },
        '<0.04'
      )
      .to(iconRef.current, { scale: 1, duration: 0.22, ease: 'power2.inOut' })

      // Content slides up
      .to(contentRef.current, { y: 0, opacity: 1, duration: 0.38, ease: 'power3.out' }, '<-0.12')

      // XP pops in
      .to(xpRef.current, { scale: 1, opacity: 1, ease: 'back.out(2.2)', duration: 0.36 }, '<0.14')

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center py-8 px-6" style={{ minHeight: 220, overflow: 'hidden' }}>
      {/* Flash overlay */}
      <div ref={flashRef} className="absolute inset-0 rounded-[inherit] pointer-events-none" style={{ background: 'white', zIndex: 10 }} />
      {/* Particle container */}
      <div ref={particleContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9 }} />

      <div ref={iconRef} style={{ fontSize: 52, lineHeight: 1, marginBottom: 12, position: 'relative', zIndex: 1 }}>⛰️</div>
      <div ref={contentRef} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div className="font-bold" style={{ fontSize: 21, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 5 }}>
          打卡成功！
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--sub)' }}>{locationName} ・ 第一次到訪</div>
      </div>
      <div ref={xpRef} style={{
        marginTop: 20, position: 'relative', zIndex: 1,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 22px', borderRadius: 14,
        background: 'var(--tint)', color: 'var(--green-d)',
        fontWeight: 700, fontSize: 18,
        fontFamily: 'var(--font-display)',
      }}>
        ⚡ +{xp} XP
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V4: CASCADE DROP — 每個元素高速依序從上方落下，expo.out，俐落現代感
// ─────────────────────────────────────────────────────────────────────────────
export function CheckinV4CascadeDrop({ replay = 0, xp = 30, locationName = '山頂公園' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const items = [iconRef.current, titleRef.current, subRef.current, lineRef.current, xpRef.current]
    gsap.set(items, { y: -32, opacity: 0 })

    const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 0.42 } })
    tl.to(items, { y: 0, opacity: 1, stagger: 0.06 })
      .to(xpRef.current, { scale: 1.04, duration: 0.12, ease: 'power2.in' }, '<0.3')
      .to(xpRef.current, { scale: 1, duration: 0.18, ease: 'back.out(3)' })
  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center py-8 px-6" style={{ minHeight: 220 }}>
      <div ref={iconRef} style={{ fontSize: 52, lineHeight: 1, marginBottom: 10 }}>⛰️</div>
      <div ref={titleRef} className="font-bold" style={{ fontSize: 21, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 4 }}>
        打卡成功！
      </div>
      <div ref={subRef} style={{ fontSize: 13.5, color: 'var(--sub)', marginBottom: 10 }}>
        {locationName} ・ 第一次到訪
      </div>
      <div ref={lineRef} style={{ width: 32, height: 2, borderRadius: 2, background: 'var(--line)', marginBottom: 14 }} />
      <div ref={xpRef} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 22px', borderRadius: 14,
        background: 'var(--tint)', color: 'var(--green-d)',
        fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)',
        boxShadow: '0 6px 18px -6px rgba(122,168,60,0.32)',
      }}>
        ⚡ +{xp} XP
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V5: NEON FLICKER — 像霓虹燈點亮，閃爍不穩後穩定發光
// ─────────────────────────────────────────────────────────────────────────────
export function CheckinV5NeonFlicker({ replay = 0, xp = 30, locationName = '山頂公園' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.set([iconRef.current, titleRef.current, subRef.current, xpRef.current], { opacity: 0 })

    const flickerIn = (el: HTMLElement | null, delay: number, color?: string) => {
      const tl = gsap.timeline({ delay })
      tl.to(el, { opacity: 0.25, duration: 0.05 })
        .to(el, { opacity: 0,    duration: 0.04 })
        .to(el, { opacity: 0.8,  duration: 0.07 })
        .to(el, { opacity: 0.35, duration: 0.04 })
        .to(el, { opacity: 0,    duration: 0.05 })
        .to(el, { opacity: 1,    duration: 0.1  })
      if (color) {
        tl.to(el, { textShadow: `0 0 14px ${color}, 0 0 30px ${color}55`, duration: 0.4, ease: 'power2.out' }, '<0.05')
          .to(el, { textShadow: `0 0 7px ${color}88`, duration: 0.5, ease: 'power2.inOut' })
      }
      return tl
    }

    const master = gsap.timeline()
    master
      .add(flickerIn(iconRef.current, 0))
      .add(flickerIn(titleRef.current, 0, '#7aa83c'), '<0.18')
      .add(flickerIn(subRef.current, 0), '<0.14')
      .add(flickerIn(xpRef.current, 0, '#6c9a34'), '<0.16')

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center py-8 px-6" style={{ minHeight: 220 }}>
      <div ref={iconRef} style={{ fontSize: 52, lineHeight: 1, marginBottom: 12 }}>⛰️</div>
      <div ref={titleRef} className="font-bold" style={{ fontSize: 21, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 5 }}>
        打卡成功！
      </div>
      <div ref={subRef} style={{ fontSize: 13.5, color: 'var(--sub)', marginBottom: 18 }}>
        {locationName} ・ 第一次到訪
      </div>
      <div ref={xpRef} style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 22px', borderRadius: 14,
        background: 'var(--tint)', color: 'var(--green-d)',
        fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)',
      }}>
        ⚡ +{xp} XP
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V6: ZOOM FOCUS — 從遠距模糊縮放拉近，像鏡頭對焦
// ─────────────────────────────────────────────────────────────────────────────
export function CheckinV6ZoomFocus({ replay = 0, xp = 30, locationName = '山頂公園' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const xpRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.set(contentRef.current, { scale: 1.72, filter: 'blur(10px)', opacity: 0 })
    gsap.set(xpRef.current, { scale: 0.6, opacity: 0, y: 8 })
    gsap.set(ringRef.current, { scale: 1.6, opacity: 0 })

    const tl = gsap.timeline()
    tl
      .to(contentRef.current, { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.65, ease: 'power4.out' })
      .to(ringRef.current, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' }, '<0.05')
      .to(xpRef.current, { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(2)', }, '<0.25')
      .to(ringRef.current, { opacity: 0, scale: 1.3, duration: 0.45, ease: 'power2.in' }, '<0.35')
  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center py-8 px-6" style={{ minHeight: 220 }}>
      {/* Focus ring */}
      <div ref={ringRef} className="absolute pointer-events-none" style={{
        top: '28%', left: '50%', width: 72, height: 72,
        marginLeft: -36, marginTop: -36,
        borderRadius: '50%',
        border: '1.5px solid var(--green)',
        boxShadow: '0 0 0 3px rgba(122,168,60,0.15)',
      }} />

      <div ref={contentRef} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52, lineHeight: 1, marginBottom: 12 }}>⛰️</div>
        <div className="font-bold" style={{ fontSize: 21, color: 'var(--ink)', fontFamily: 'var(--font-display)', marginBottom: 5 }}>
          打卡成功！
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--sub)' }}>
          {locationName} ・ 第一次到訪
        </div>
      </div>
      <div ref={xpRef} style={{
        marginTop: 18,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 22px', borderRadius: 14,
        background: 'var(--tint)', color: 'var(--green-d)',
        fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)',
      }}>
        ⚡ +{xp} XP
      </div>
    </div>
  )
}
