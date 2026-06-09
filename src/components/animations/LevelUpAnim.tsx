'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

interface BaseProps {
  replay?: number
  prevLevel?: number
  level?: number
}

// ─────────────────────────────────────────────────────────────────────────────
// V1: ASCEND — 深色舞台，等級數字從下方升起，金色光環擴散
// ─────────────────────────────────────────────────────────────────────────────
export function LevelUpV1Ascend({ replay = 0, prevLevel = 5, level = 6 }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const oldNumRef = useRef<HTMLDivElement>(null)
  const newNumRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const ring1Ref = useRef<HTMLDivElement>(null)
  const ring2Ref = useRef<HTMLDivElement>(null)
  const starsContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const starsCon = starsContainerRef.current!
    starsCon.innerHTML = ''

    const stars = Array.from({ length: 7 }, (_, i) => {
      const s = document.createElement('div')
      const angle = (i / 7) * Math.PI * 2
      const dist = 60 + (i % 3) * 12
      s.style.cssText = `
        position:absolute; top:50%; left:50%;
        width:${5 + (i % 3) * 2}px; height:${5 + (i % 3) * 2}px;
        background:#cf9a3e; border-radius:1px;
        transform:translate(-50%,-50%) rotate(45deg);
        margin-top:${Math.sin(angle) * dist}px;
        margin-left:${Math.cos(angle) * dist}px;
      `
      starsCon.appendChild(s)
      return s
    })

    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(oldNumRef.current, { opacity: 1, y: 0, scale: 1 })
    gsap.set(newNumRef.current, { opacity: 0, y: 64, scale: 0.45 })
    gsap.set(labelRef.current, { opacity: 0, letterSpacing: '0.55em', y: 10 })
    gsap.set([ring1Ref.current, ring2Ref.current], { scale: 0.4, opacity: 0 })
    gsap.set(stars, { opacity: 0, scale: 0 })

    const tl = gsap.timeline()

    tl
      // Overlay dims in
      .to(overlayRef.current, { opacity: 1, duration: 0.32, ease: 'power2.out' })

      // Old number fades out upward
      .to(oldNumRef.current, { opacity: 0, y: -48, scale: 0.6, duration: 0.38, ease: 'power3.in' }, '<0.12')

      // Rings pulse outward
      .to(ring1Ref.current, { scale: 2.6, opacity: 0, duration: 0.9, ease: 'power2.out' }, '<0.08')
      .to(ring2Ref.current, { scale: 3.2, opacity: 0, duration: 1.1, ease: 'power2.out' }, '<0.12')

      // New number ascends
      .to(newNumRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power4.out' }, '<-0.3')

      // "LEVEL UP" label
      .to(labelRef.current, { opacity: 1, letterSpacing: '0.15em', y: 0, duration: 0.52, ease: 'power3.out' }, '<0.28')

      // Stars appear staggered
      .to(stars, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.5)', stagger: 0.06 }, '<-0.1')

      // Subtle gold glow pulse on new number (repeat twice)
      .to(newNumRef.current, {
        textShadow: '0 0 28px rgba(207,154,62,0.9), 0 0 60px rgba(207,154,62,0.4)',
        duration: 0.4, ease: 'power2.inOut', repeat: 2, yoyo: true
      }, '<0.2')

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      {/* Dark overlay */}
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(160deg, rgba(16,24,40,0.88), rgba(27,40,62,0.92))',
        borderRadius: 'inherit', zIndex: 0,
      }} />

      {/* Glow rings */}
      <div ref={ring1Ref} className="absolute pointer-events-none" style={{
        top: '50%', left: '50%', width: 100, height: 100,
        marginTop: -50, marginLeft: -50,
        borderRadius: '50%', border: '1.5px solid rgba(207,154,62,0.6)',
        zIndex: 1,
      }} />
      <div ref={ring2Ref} className="absolute pointer-events-none" style={{
        top: '50%', left: '50%', width: 100, height: 100,
        marginTop: -50, marginLeft: -50,
        borderRadius: '50%', border: '1px solid rgba(207,154,62,0.3)',
        zIndex: 1,
      }} />

      {/* Stars container */}
      <div ref={starsContainerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }} />

      {/* Level numbers */}
      <div className="relative" style={{ zIndex: 3, textAlign: 'center' }}>
        <div ref={oldNumRef} style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          fontSize: 64, fontWeight: 900, fontFamily: 'var(--font-display)',
          color: 'rgba(255,255,255,0.35)',
        }}>
          {prevLevel}
        </div>
        <div ref={newNumRef} style={{
          fontSize: 72, fontWeight: 900, fontFamily: 'var(--font-display)',
          color: '#e8b84b',
          textShadow: '0 4px 20px rgba(207,154,62,0.5)',
          lineHeight: 1,
        }}>
          {level}
        </div>
        <div ref={labelRef} style={{
          fontSize: 11, fontWeight: 800, color: '#cf9a3e',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          marginTop: 8,
        }}>
          Level Up
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V2: SURGE — 白色衝擊波 + 震動 + 等級數字能量爆發
// ─────────────────────────────────────────────────────────────────────────────
export function LevelUpV2Surge({ replay = 0, prevLevel = 5, level = 6 }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const ringContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
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

    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(flashRef.current, { opacity: 0 })
    gsap.set(numRef.current, { scale: 1, opacity: 0, textContent: String(prevLevel) })
    gsap.set(labelRef.current, { opacity: 0, y: 10 })
    gsap.set(rings, { scale: 0.5, opacity: 0 })

    const tl = gsap.timeline()

    tl
      // Overlay
      .to(overlayRef.current, { opacity: 1, duration: 0.28, ease: 'power2.out' })

      // Number appears
      .to(numRef.current, { opacity: 1, duration: 0.2 }, '<0.1')

      // Surging scale sequence: compress → explode → settle
      .to(numRef.current, { scale: 0.35, duration: 0.18, ease: 'power4.in' }, '+=0.08')

      // Flash on impact
      .to(flashRef.current, { opacity: 1, duration: 0.06 }, '+=0')
      .to(flashRef.current, { opacity: 0, duration: 0.22, ease: 'power3.out' })

      // Explosion + number change
      .to(numRef.current, {
        scale: 1.55, duration: 0.22, ease: 'power4.out',
        onStart() {
          if (numRef.current) numRef.current.textContent = String(level)
        },
      }, '<')

      // Shake
      .to(numRef.current, { x: -5, duration: 0.04 }, '<0.06')
      .to(numRef.current, { x: 5, duration: 0.04 })
      .to(numRef.current, { x: -3, duration: 0.04 })
      .to(numRef.current, { x: 3, duration: 0.04 })
      .to(numRef.current, { x: 0, duration: 0.04 })

      // Settle back to scale 1 with elastic feel
      .to(numRef.current, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, '<0.04')

      // Rings burst outward staggered
      .to(rings, {
        scale: 3.5, opacity: 0, duration: 0.75, ease: 'power2.out', stagger: 0.1
      }, '<-0.55')

      // Label
      .to(labelRef.current, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, '<0.3')

      // Glow pulse
      .to(numRef.current, {
        textShadow: '0 0 32px rgba(207,154,62,1), 0 0 64px rgba(207,154,62,0.5)',
        duration: 0.35, ease: 'power2.inOut', yoyo: true, repeat: 1,
      }, '<-0.1')

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(160deg, rgba(14,20,36,0.9), rgba(24,34,58,0.94))',
        borderRadius: 'inherit', zIndex: 0,
      }} />

      {/* Flash */}
      <div ref={flashRef} className="absolute inset-0 pointer-events-none" style={{
        background: 'white', borderRadius: 'inherit', zIndex: 5,
      }} />

      {/* Energy rings */}
      <div ref={ringContainerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />

      <div className="relative" style={{ zIndex: 4, textAlign: 'center' }}>
        <div ref={numRef} style={{
          fontSize: 76, fontWeight: 900, fontFamily: 'var(--font-display)',
          color: '#e8b84b', lineHeight: 1,
          textShadow: '0 4px 16px rgba(207,154,62,0.3)',
        }}>
          {prevLevel}
        </div>
        <div ref={labelRef} style={{
          fontSize: 11, fontWeight: 800, color: '#cf9a3e',
          letterSpacing: '0.28em', textTransform: 'uppercase',
          marginTop: 8, y: 10,
        }}>
          Level Up
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V3: CELESTIAL — 星塵從外圍匯聚，數字旋轉升起，光芒射出
// ─────────────────────────────────────────────────────────────────────────────
export function LevelUpV3Celestial({ replay = 0, prevLevel = 5, level = 6 }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLDivElement>(null)
  const sublabelRef = useRef<HTMLDivElement>(null)
  const starContainerRef = useRef<HTMLDivElement>(null)
  const rayContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const starCon = starContainerRef.current!
    const rayCon = rayContainerRef.current!
    starCon.innerHTML = ''
    rayCon.innerHTML = ''

    // Converging stars (approach from outside)
    const stars = Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2
      const dist = 105 + (i % 4) * 18
      const s = document.createElement('div')
      const sz = 3 + (i % 3) * 2
      s.style.cssText = `
        position:absolute; top:50%; left:50%;
        width:${sz}px; height:${sz}px;
        border-radius:${i % 2 === 0 ? '50%' : '1px'};
        background:${i % 3 === 0 ? '#e8b84b' : i % 3 === 1 ? '#fff' : '#cf9a3e'};
        margin-top:${Math.sin(angle) * dist}px;
        margin-left:${Math.cos(angle) * dist}px;
        transform:translate(-50%,-50%) rotate(45deg);
      `
      starCon.appendChild(s)
      return { el: s, angle, dist }
    })

    // Rays that shoot outward after number appears
    const rays = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const r = document.createElement('div')
      r.style.cssText = `
        position:absolute; top:50%; left:50%;
        width:2px; height:38px;
        background:linear-gradient(to top, rgba(232,184,75,0.8), transparent);
        transform-origin:50% 100%;
        transform:translate(-50%, -100%) rotate(${(angle * 180) / Math.PI}deg);
      `
      rayCon.appendChild(r)
      return r
    })

    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(numRef.current, { opacity: 0, rotation: 720, scale: 0.2 })
    gsap.set(sublabelRef.current, { opacity: 0, y: 8 })
    gsap.set(rays, { scaleY: 0, opacity: 0 })
    stars.forEach(({ el }) => gsap.set(el, { opacity: 0 }))

    const tl = gsap.timeline()

    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.35, ease: 'power2.out' })

      // Stars appear and converge inward
      .to(stars.map(s => s.el), {
        opacity: 1, duration: 0.15, stagger: 0.04,
      }, '<0.1')
      .to(stars.map(s => s.el), {
        marginTop: (i) => Math.sin(stars[i].angle) * 18,
        marginLeft: (i) => Math.cos(stars[i].angle) * 18,
        opacity: 0,
        duration: 0.55,
        ease: 'power3.in',
        stagger: 0.025,
      }, '<0.12')

      // Number spins and rises out of the converging stars
      .to(numRef.current, {
        opacity: 1, rotation: 0, scale: 1,
        duration: 0.72, ease: 'back.out(1.8)',
      }, '<0.3')

      // Rays shoot out
      .to(rays, {
        scaleY: 1, opacity: 1, duration: 0.3, ease: 'power4.out', stagger: 0.03,
      }, '<0.28')
      .to(rays, {
        opacity: 0, scaleY: 0, duration: 0.45, ease: 'power2.in', stagger: 0.03,
      }, '<0.25')

      // Label
      .to(sublabelRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, '<-0.1')

      // Continuous gentle ambient glow
      .to(numRef.current, {
        textShadow: '0 0 40px rgba(232,184,75,0.9), 0 0 80px rgba(207,154,62,0.4)',
        duration: 0.5, ease: 'power2.inOut', yoyo: true, repeat: 2,
      }, '<0.1')

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, rgba(30,22,58,0.96) 0%, rgba(14,18,40,0.98) 100%)',
        borderRadius: 'inherit', zIndex: 0,
      }} />

      <div ref={starContainerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 2 }} />
      <div ref={rayContainerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 3, top: '50%', left: '50%', width: 0, height: 0 }} />

      <div className="relative" style={{ zIndex: 4, textAlign: 'center' }}>
        <div ref={numRef} style={{
          fontSize: 76, fontWeight: 900, fontFamily: 'var(--font-display)',
          color: '#e8b84b', lineHeight: 1,
          textShadow: '0 4px 24px rgba(232,184,75,0.45)',
        }}>
          {level}
        </div>
        <div ref={sublabelRef} style={{
          fontSize: 11, fontWeight: 800, color: '#cf9a3e',
          letterSpacing: '0.3em', textTransform: 'uppercase',
          marginTop: 8,
        }}>
          Level Up
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V4: ORBIT RING — SVG 圓弧從 0 描繪到滿圓，數字在圓心升起
// ─────────────────────────────────────────────────────────────────────────────
export function LevelUpV4OrbitRing({ replay = 0, prevLevel = 5, level = 6 }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)
  const numRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const burstContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const circumference = 2 * Math.PI * 52
    const burstCon = burstContainerRef.current!
    burstCon.innerHTML = ''
    const bursts = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const b = document.createElement('div')
      b.style.cssText = `position:absolute;top:50%;left:50%;width:3px;height:14px;background:linear-gradient(to top,#e8b84b,transparent);transform-origin:50% 100%;transform:translate(-50%,-100%) rotate(${(angle * 180) / Math.PI}deg);`
      burstCon.appendChild(b)
      return b
    })
    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(arcRef.current, { strokeDasharray: circumference, strokeDashoffset: circumference })
    gsap.set(numRef.current, { opacity: 0, y: 24, scale: 0.65 })
    gsap.set(labelRef.current, { opacity: 0 })
    gsap.set(bursts, { scaleY: 0, opacity: 0 })
    const tl = gsap.timeline()
    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.28, ease: 'power2.out' })
      .to(arcRef.current, { strokeDashoffset: 0, duration: 1.05, ease: 'power2.inOut' }, '<0.08')
      .to(numRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(2)' }, '<0.38')
      .to(bursts, { scaleY: 1, opacity: 1, duration: 0.22, ease: 'power4.out', stagger: 0.03 }, '<0.5')
      .to(bursts, { opacity: 0, scaleY: 0, duration: 0.4, ease: 'power2.in', stagger: 0.03 }, '<0.18')
      .to(labelRef.current, { opacity: 1, duration: 0.35, ease: 'power3.out' }, '<-0.15')
      .to(arcRef.current, { attr: { stroke: 'rgba(232,184,75,0.9)' }, duration: 0.25, yoyo: true, repeat: 1 }, '<-0.2')
  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg,rgba(14,20,36,0.9),rgba(22,30,52,0.94))', borderRadius: 'inherit', zIndex: 0 }} />
      <svg className="absolute pointer-events-none" width="122" height="122" viewBox="0 0 122 122" style={{ zIndex: 2 }}>
        <circle cx="61" cy="61" r="52" fill="none" stroke="rgba(207,154,62,0.12)" strokeWidth="2" />
        <circle ref={arcRef} cx="61" cy="61" r="52" fill="none" stroke="rgba(207,154,62,0.7)" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-90 61 61)" />
      </svg>
      <div ref={burstContainerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }} />
      <div className="relative" style={{ zIndex: 4, textAlign: 'center' }}>
        <div ref={numRef} style={{ fontSize: 64, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#e8b84b', lineHeight: 1, textShadow: '0 4px 20px rgba(207,154,62,0.45)' }}>{level}</div>
        <div ref={labelRef} style={{ fontSize: 10.5, fontWeight: 800, color: '#cf9a3e', letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 7 }}>Level Up</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V5: GLITCH — RGB 分色干擾條，數字 scramble 後穩定
// ─────────────────────────────────────────────────────────────────────────────
export function LevelUpV5Glitch({ replay = 0, prevLevel = 5, level = 6 }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const numRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)
  const glitchBarContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const barCon = glitchBarContainerRef.current!
    barCon.innerHTML = ''
    const bars = Array.from({ length: 6 }, (_, i) => {
      const b = document.createElement('div')
      const h = 2 + (i % 3) * 3
      const top = 10 + i * 14 + (i % 2) * 8
      b.style.cssText = `position:absolute;left:0;right:0;height:${h}px;top:${top}%;background:rgba(${i % 2 === 0 ? '255,0,80' : '0,220,255'},0.35);pointer-events:none;`
      barCon.appendChild(b)
      return b
    })
    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(numRef.current, { opacity: 0 })
    gsap.set(labelRef.current, { opacity: 0 })
    gsap.set(bars, { scaleX: 0, opacity: 0 })
    const digits = '0123456789'
    let scrambleInterval: ReturnType<typeof setInterval>
    const tl = gsap.timeline()
    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.25, ease: 'power2.out' })
      .to(numRef.current, {
        opacity: 1, duration: 0.1,
        textShadow: '3px 0 rgba(255,0,80,0.75), -3px 0 rgba(0,220,255,0.75)',
        onStart() {
          let count = 0
          scrambleInterval = setInterval(() => {
            if (numRef.current) numRef.current.textContent = digits[Math.floor(Math.random() * 10)]
            count++
            if (count > 16) { clearInterval(scrambleInterval); if (numRef.current) numRef.current.textContent = String(level) }
          }, 48)
        },
      }, '<0.1')
      .to(bars, { scaleX: 1, opacity: 1, duration: 0.06, stagger: 0.04, ease: 'none' }, '<0.05')
      .to(bars, { x: () => (Math.random() - 0.5) * 18, duration: 0.05, stagger: 0.03 }, '<0.06')
      .to(bars, { x: 0, opacity: 0, duration: 0.06, stagger: 0.03 }, '<0.12')
      .to(numRef.current, { textShadow: 'none', duration: 0.4, ease: 'power3.out', delay: 0.35 })
      .to(numRef.current, { textShadow: '0 4px 24px rgba(207,154,62,0.55)', duration: 0.4 }, '<0.1')
      .to(labelRef.current, { opacity: 1, duration: 0.3 }, '<0.1')
  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg,rgba(10,14,28,0.95),rgba(18,22,42,0.97))', borderRadius: 'inherit', zIndex: 0 }} />
      <div ref={glitchBarContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 3 }} />
      <div className="relative" style={{ zIndex: 4, textAlign: 'center' }}>
        <div ref={numRef} style={{ fontSize: 76, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#e8b84b', lineHeight: 1 }}>{prevLevel}</div>
        <div ref={labelRef} style={{ fontSize: 10.5, fontWeight: 800, color: '#cf9a3e', letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 8 }}>Level Up</div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V6: SHATTER & RISE — 碎片向外炸散，新等級從中心升起
// ─────────────────────────────────────────────────────────────────────────────
export function LevelUpV6ShatterRise({ replay = 0, prevLevel = 5, level = 6 }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const shardContainerRef = useRef<HTMLDivElement>(null)
  const newNumRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const shardCon = shardContainerRef.current!
    shardCon.innerHTML = ''
    const shards = Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2
      const s = document.createElement('div')
      const w = 12 + (i % 3) * 8
      const h = 8 + (i % 4) * 5
      s.style.cssText = `position:absolute;top:50%;left:50%;width:${w}px;height:${h}px;background:rgba(207,154,62,${0.4 + (i % 3) * 0.18});border-radius:2px;transform:translate(-50%,-50%) rotate(${i * 42}deg);`
      shardCon.appendChild(s)
      return { el: s, angle }
    })
    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(newNumRef.current, { opacity: 0, scale: 0, y: 20 })
    gsap.set(labelRef.current, { opacity: 0 })
    const tl = gsap.timeline()
    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.28 })
      .to(shards.map(s => s.el), {
        x: (i) => Math.cos(shards[i].angle) * (55 + (i % 3) * 20),
        y: (i) => Math.sin(shards[i].angle) * (55 + (i % 3) * 20),
        rotation: (i) => (i % 2 === 0 ? 1 : -1) * (90 + i * 22),
        opacity: 0, duration: 0.55, ease: 'power3.out', stagger: 0.035,
      }, '<0.1')
      .to(newNumRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.58, ease: 'back.out(1.8)' }, '<0.12')
      .to(newNumRef.current, { textShadow: '0 0 28px rgba(207,154,62,0.9), 0 0 56px rgba(207,154,62,0.4)', duration: 0.38, yoyo: true, repeat: 1 }, '<0.35')
      .to(labelRef.current, { opacity: 1, duration: 0.3 }, '<0.25')
  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg,rgba(14,18,36,0.91),rgba(22,26,48,0.95))', borderRadius: 'inherit', zIndex: 0 }} />
      <div ref={shardContainerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }} />
      <div className="relative" style={{ zIndex: 4, textAlign: 'center' }}>
        <div ref={newNumRef} style={{ fontSize: 76, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#e8b84b', lineHeight: 1 }}>{level}</div>
        <div ref={labelRef} style={{ fontSize: 10.5, fontWeight: 800, color: '#cf9a3e', letterSpacing: '0.28em', textTransform: 'uppercase', marginTop: 8 }}>Level Up</div>
      </div>
    </div>
  )
}
