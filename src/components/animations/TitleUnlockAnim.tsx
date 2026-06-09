'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

interface BaseProps {
  replay?: number
  title?: string
  subtitle?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// V1: SEAL REVEAL — SVG 圓形邊框描繪，稱號從霧中浮現，光芒射出
// ─────────────────────────────────────────────────────────────────────────────
export function TitleV1SealReveal({ replay = 0, title = '登山王', subtitle = '完成所有山岳打卡' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const circleRef = useRef<SVGCircleElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const rayContainerRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const rayCon = rayContainerRef.current!
    rayCon.innerHTML = ''

    const rays = Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2
      const r = document.createElement('div')
      r.style.cssText = `
        position:absolute; top:50%; left:50%;
        width:1.5px; height:${28 + (i % 3) * 10}px;
        background:linear-gradient(to top, rgba(207,154,62,0.75), transparent);
        transform-origin:50% 100%;
        transform:translate(-50%, -100%) rotate(${(angle * 180) / Math.PI}deg);
      `
      rayCon.appendChild(r)
      return r
    })

    // SVG circle circumference for stroke-dashoffset animation
    const circumference = 2 * Math.PI * 58 // r=58

    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(circleRef.current, {
      strokeDasharray: circumference,
      strokeDashoffset: circumference,
      opacity: 0,
    })
    gsap.set(titleRef.current, { opacity: 0, filter: 'blur(9px)', scale: 0.88 })
    gsap.set(subtitleRef.current, { opacity: 0, y: 8 })
    gsap.set(badgeRef.current, { opacity: 0, scale: 0.8 })
    gsap.set(rays, { scaleY: 0, opacity: 0 })

    const tl = gsap.timeline()

    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })

      // Circle draws itself
      .to(circleRef.current, { opacity: 1, duration: 0.1 }, '<0.1')
      .to(circleRef.current, {
        strokeDashoffset: 0, duration: 0.85, ease: 'power2.inOut',
      }, '<0.05')

      // Circle glow pulse
      .to(circleRef.current, {
        attr: { stroke: 'rgba(232,184,75,1)' },
        duration: 0.2, ease: 'power2.inOut',
      }, '<0.75')
      .to(circleRef.current, {
        attr: { stroke: 'rgba(207,154,62,0.65)' },
        duration: 0.35,
      })

      // Title reveals from blur
      .to(titleRef.current, {
        opacity: 1, filter: 'blur(0px)', scale: 1,
        duration: 0.58, ease: 'power3.out',
      }, '<-0.3')

      // Rays shoot out
      .to(rays, {
        scaleY: 1, opacity: 1, duration: 0.28, ease: 'power4.out', stagger: 0.025,
      }, '<0.15')
      .to(rays, {
        opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.025,
      }, '<0.2')

      // Subtitle + badge
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }, '<-0.15')
      .to(badgeRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, '<0.06')

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(160deg, rgba(16,24,40,0.9), rgba(22,30,50,0.94))',
        borderRadius: 'inherit', zIndex: 0,
      }} />

      {/* SVG Circle border */}
      <svg className="absolute pointer-events-none" width="134" height="134" viewBox="0 0 134 134" style={{ zIndex: 2 }}>
        <circle
          ref={circleRef}
          cx="67" cy="67" r="58"
          fill="none"
          stroke="rgba(207,154,62,0.7)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Ray container */}
      <div ref={rayContainerRef} className="absolute pointer-events-none" style={{ zIndex: 1, inset: 0 }} />

      <div className="relative" style={{ zIndex: 3, textAlign: 'center', padding: '0 24px' }}>
        <div ref={titleRef} style={{
          fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-display)',
          color: '#e8b84b',
          textShadow: '0 2px 16px rgba(207,154,62,0.5)',
          letterSpacing: '0.06em',
        }}>
          {title}
        </div>
        <div ref={subtitleRef} style={{
          fontSize: 11.5, color: 'rgba(255,255,255,0.45)',
          marginTop: 6, letterSpacing: '0.05em',
        }}>
          {subtitle}
        </div>
        <div ref={badgeRef} style={{
          marginTop: 14, display: 'inline-block',
          padding: '5px 14px', borderRadius: 999,
          background: 'rgba(207,154,62,0.18)',
          border: '1px solid rgba(207,154,62,0.4)',
          fontSize: 11, fontWeight: 700,
          color: '#e8b84b', letterSpacing: '0.08em',
        }}>
          稱號解鎖
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V2: RIBBON UNFURL — 橫幅從中心向兩側展開，金色光掃過，字符 stagger
// ─────────────────────────────────────────────────────────────────────────────
export function TitleV2RibbonUnfurl({ replay = 0, title = '登山王', subtitle = '完成所有山岳打卡' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const ribbonRef = useRef<HTMLDivElement>(null)
  const shimmerRef = useRef<HTMLDivElement>(null)
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const deco1Ref = useRef<HTMLDivElement>(null)
  const deco2Ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const titleCon = titleContainerRef.current!

    // Split title into individual char spans
    titleCon.innerHTML = title.split('').map(char =>
      `<span style="display:inline-block; opacity:0; transform:translateY(10px)">${char}</span>`
    ).join('')
    const chars = titleCon.querySelectorAll('span')

    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(ribbonRef.current, { scaleX: 0, transformOrigin: 'center' })
    gsap.set(shimmerRef.current, { x: '-110%' })
    gsap.set(subtitleRef.current, { opacity: 0, y: 8 })
    gsap.set([deco1Ref.current, deco2Ref.current], { scaleX: 0, opacity: 0 })

    const tl = gsap.timeline()

    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })

      // Ribbon unfurls
      .to(ribbonRef.current, { scaleX: 1, duration: 0.58, ease: 'expo.out' }, '<0.1')

      // Deco lines
      .to([deco1Ref.current, deco2Ref.current], {
        scaleX: 1, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.05,
      }, '<0.15')

      // Title chars stagger in
      .to(chars, {
        opacity: 1, y: 0, duration: 0.25, ease: 'power3.out', stagger: 0.055,
      }, '<0.12')

      // Shimmer sweeps
      .to(shimmerRef.current, { x: '110%', duration: 0.55, ease: 'power2.inOut' }, '<0.2')

      // Subtitle
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.38, ease: 'power3.out' }, '<0.1')

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(160deg, rgba(18,24,42,0.88), rgba(26,32,52,0.92))',
        borderRadius: 'inherit', zIndex: 0,
      }} />

      <div className="relative" style={{ zIndex: 2, textAlign: 'center', width: '100%', padding: '0 12px' }}>
        {/* Decorative lines */}
        <div className="flex items-center gap-3 justify-center mb-4">
          <div ref={deco1Ref} style={{
            height: 1, width: 40, transformOrigin: 'right',
            background: 'linear-gradient(to left, rgba(207,154,62,0.7), transparent)',
          }} />
          <div style={{ width: 6, height: 6, borderRadius: 1, background: '#cf9a3e', transform: 'rotate(45deg)' }} />
          <div ref={deco2Ref} style={{
            height: 1, width: 40, transformOrigin: 'left',
            background: 'linear-gradient(to right, rgba(207,154,62,0.7), transparent)',
          }} />
        </div>

        {/* Ribbon */}
        <div ref={ribbonRef} className="relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(207,154,62,0.22), rgba(232,184,75,0.28))',
          border: '1px solid rgba(207,154,62,0.4)',
          borderRadius: 8, padding: '12px 24px',
          backdropFilter: 'blur(4px)',
        }}>
          {/* Shimmer */}
          <div ref={shimmerRef} className="absolute inset-y-0 pointer-events-none" style={{
            width: '35%',
            background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)',
          }} />

          <div ref={titleContainerRef} style={{
            fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: '#e8b84b', letterSpacing: '0.08em',
            textShadow: '0 2px 12px rgba(207,154,62,0.4)',
          }} />
        </div>

        <div ref={subtitleRef} style={{
          fontSize: 11.5, color: 'rgba(255,255,255,0.42)',
          marginTop: 10, letterSpacing: '0.05em',
        }}>
          {subtitle}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// V3: CROWN DROP — 王冠從上方跌落彈跳，金色粒子雨，稱號卡片放大入場
// ─────────────────────────────────────────────────────────────────────────────
export function TitleV3CrownDrop({ replay = 0, title = '登山王', subtitle = '完成所有山岳打卡' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const crownRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const particleContainerRef = useRef<HTMLDivElement>(null)
  const shineRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const pCon = particleContainerRef.current!
    pCon.innerHTML = ''

    // Rain particles from top
    const particles = Array.from({ length: 18 }, (_, i) => {
      const p = document.createElement('div')
      const sz = 3 + (i % 3) * 2
      const startX = (i / 18) * 100
      p.style.cssText = `
        position:absolute; top:-12px; left:${startX}%;
        width:${sz}px; height:${sz}px;
        border-radius:${i % 2 === 0 ? '50%' : '1px'};
        background:${i % 3 === 0 ? '#e8b84b' : i % 3 === 1 ? '#cf9a3e' : 'rgba(255,255,255,0.7)'};
        transform:rotate(${i * 23}deg);
        opacity:0;
      `
      pCon.appendChild(p)
      return p
    })

    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(crownRef.current, { y: -90, rotation: 12, opacity: 0 })
    gsap.set(cardRef.current, { scale: 0.72, opacity: 0 })
    gsap.set([titleRef.current, subtitleRef.current], { opacity: 0 })
    gsap.set(shineRef.current, { x: '-110%' })

    const tl = gsap.timeline()

    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })

      // Crown drops with bounce
      .to(crownRef.current, {
        y: 0, rotation: 0, opacity: 1,
        duration: 0.72, ease: 'bounce.out',
      }, '<0.12')

      // Particles rain down staggered
      .to(particles, {
        y: (i) => 130 + (i % 4) * 28,
        opacity: (i) => [1, 0.8, 0.6, 0.9][i % 4],
        duration: (i) => 0.55 + (i % 3) * 0.18,
        ease: 'power2.in',
        stagger: 0.035,
        rotation: (i) => i % 2 === 0 ? 180 : -90,
      }, '<0.08')

      // Particles fade out
      .to(particles, {
        opacity: 0, duration: 0.35, stagger: 0.02, ease: 'power2.out',
      }, '<0.45')

      // Title card zooms in
      .to(cardRef.current, {
        scale: 1, opacity: 1, duration: 0.46, ease: 'back.out(1.9)',
      }, '<-0.5')

      // Title + subtitle
      .to(titleRef.current, { opacity: 1, duration: 0.32, ease: 'power2.out' }, '<0.18')
      .to(subtitleRef.current, { opacity: 1, duration: 0.28, ease: 'power2.out' }, '<0.08')

      // Shine sweep on card
      .to(shineRef.current, { x: '110%', duration: 0.52, ease: 'power2.inOut' }, '<0.1')

  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(160deg, rgba(16,22,42,0.9), rgba(22,28,48,0.94))',
        borderRadius: 'inherit', zIndex: 0,
      }} />

      <div ref={particleContainerRef} className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }} />

      <div className="relative" style={{ zIndex: 3, textAlign: 'center', padding: '0 20px' }}>
        {/* Crown */}
        <div ref={crownRef} style={{ fontSize: 36, lineHeight: 1, marginBottom: 10 }}>👑</div>

        {/* Title card */}
        <div ref={cardRef} className="relative overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(207,154,62,0.2), rgba(232,184,75,0.26))',
          border: '1px solid rgba(207,154,62,0.5)',
          borderRadius: 12, padding: '14px 28px',
        }}>
          {/* Shine */}
          <div ref={shineRef} className="absolute inset-y-0 pointer-events-none" style={{
            width: '40%',
            background: 'linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          }} />

          <div ref={titleRef} style={{
            fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-display)',
            color: '#e8b84b', letterSpacing: '0.06em',
            textShadow: '0 2px 14px rgba(207,154,62,0.5)',
          }}>
            {title}
          </div>
        </div>

        <div ref={subtitleRef} style={{
          fontSize: 11.5, color: 'rgba(255,255,255,0.42)',
          marginTop: 10, letterSpacing: '0.05em',
        }}>
          {subtitle}
        </div>
      </div>
    </div>
  )
}


// V4: ANCIENT SCROLL — 上下兩半向外展開，捲軸感
export function TitleV4AncientScroll({ replay = 0, title = '登山王', subtitle = '完成所有山岳打卡' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const topCoverRef = useRef<HTMLDivElement>(null)
  const bottomCoverRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const decoTopRef = useRef<HTMLDivElement>(null)
  const decoBottomRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(topCoverRef.current, { y: '0%' })
    gsap.set(bottomCoverRef.current, { y: '0%' })
    gsap.set(contentRef.current, { opacity: 0 })
    gsap.set([titleRef.current, subtitleRef.current], { opacity: 0, y: 8 })
    gsap.set([decoTopRef.current, decoBottomRef.current], { scaleX: 0, opacity: 0 })
    const tl = gsap.timeline()
    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .to(topCoverRef.current, { y: '-102%', duration: 0.65, ease: 'expo.inOut' }, '<0.15')
      .to(bottomCoverRef.current, { y: '102%', duration: 0.65, ease: 'expo.inOut' }, '<')
      .to(contentRef.current, { opacity: 1, duration: 0.2 }, '<0.35')
      .to([decoTopRef.current, decoBottomRef.current], { scaleX: 1, opacity: 1, duration: 0.4, ease: 'power3.out', stagger: 0.06 }, '<0.1')
      .to(titleRef.current, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' }, '<0.1')
      .to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, '<0.1')
  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg,rgba(18,24,42,0.9),rgba(26,32,52,0.94))', borderRadius: 'inherit', zIndex: 0 }} />
      <div ref={topCoverRef} className="absolute left-0 right-0 pointer-events-none" style={{ top: 0, height: '50%', background: 'linear-gradient(to bottom,rgba(22,28,50,0.99),rgba(18,24,46,0.99))', zIndex: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 2 }}>
        <div style={{ width: '75%', height: 1.5, background: 'linear-gradient(to right,transparent,rgba(207,154,62,0.65),transparent)' }} />
      </div>
      <div ref={bottomCoverRef} className="absolute left-0 right-0 pointer-events-none" style={{ bottom: 0, height: '50%', background: 'linear-gradient(to top,rgba(22,28,50,0.99),rgba(18,24,46,0.99))', zIndex: 4, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 2 }}>
        <div style={{ width: '75%', height: 1.5, background: 'linear-gradient(to right,transparent,rgba(207,154,62,0.65),transparent)' }} />
      </div>
      <div ref={contentRef} className="relative" style={{ zIndex: 3, textAlign: 'center', padding: '0 24px' }}>
        <div ref={decoTopRef} style={{ height: 1, width: 56, background: 'linear-gradient(to right,transparent,rgba(207,154,62,0.6),transparent)', margin: '0 auto 12px', transformOrigin: 'center' }} />
        <div ref={titleRef} style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#e8b84b', letterSpacing: '0.08em' }}>{title}</div>
        <div ref={subtitleRef} style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)', marginTop: 8, letterSpacing: '0.05em' }}>{subtitle}</div>
        <div ref={decoBottomRef} style={{ height: 1, width: 56, background: 'linear-gradient(to right,transparent,rgba(207,154,62,0.6),transparent)', margin: '12px auto 0', transformOrigin: 'center' }} />
      </div>
    </div>
  )
}

// V5: GATEWAY — 兩道門板從中心左右打開，稱號從門縫中顯現
export function TitleV5Gateway({ replay = 0, title = '登山王', subtitle = '完成所有山岳打卡' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const doorLeftRef = useRef<HTMLDivElement>(null)
  const doorRightRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const edgeLeftRef = useRef<HTMLDivElement>(null)
  const edgeRightRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(doorLeftRef.current, { x: '0%' })
    gsap.set(doorRightRef.current, { x: '0%' })
    gsap.set(contentRef.current, { opacity: 0, scale: 0.85 })
    gsap.set([titleRef.current, subtitleRef.current], { opacity: 0 })
    gsap.set([edgeLeftRef.current, edgeRightRef.current], { opacity: 0 })
    const tl = gsap.timeline()
    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .to(doorLeftRef.current, { x: '-102%', duration: 0.62, ease: 'expo.inOut' }, '<0.12')
      .to(doorRightRef.current, { x: '102%', duration: 0.62, ease: 'expo.inOut' }, '<')
      .to([edgeLeftRef.current, edgeRightRef.current], { opacity: 1, duration: 0.18 }, '<0.4')
      .to([edgeLeftRef.current, edgeRightRef.current], { opacity: 0, duration: 0.5, ease: 'power2.out' }, '<0.25')
      .to(contentRef.current, { opacity: 1, scale: 1, duration: 0.48, ease: 'back.out(1.8)' }, '<-0.48')
      .to(titleRef.current, { opacity: 1, duration: 0.35 }, '<0.22')
      .to(subtitleRef.current, { opacity: 1, duration: 0.3 }, '<0.1')
  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg,rgba(14,20,40,0.92),rgba(20,26,48,0.96))', borderRadius: 'inherit', zIndex: 0 }} />
      <div ref={doorLeftRef} className="absolute top-0 bottom-0 left-0 pointer-events-none" style={{ width: '51%', background: 'linear-gradient(to left,rgba(22,28,52,0.98),rgba(16,22,44,0.99))', zIndex: 4 }} />
      <div ref={doorRightRef} className="absolute top-0 bottom-0 right-0 pointer-events-none" style={{ width: '51%', background: 'linear-gradient(to right,rgba(22,28,52,0.98),rgba(16,22,44,0.99))', zIndex: 4 }} />
      <div ref={edgeLeftRef} className="absolute top-0 bottom-0 pointer-events-none" style={{ left: '49%', width: 2, background: 'linear-gradient(to bottom,transparent,rgba(207,154,62,0.85),transparent)', zIndex: 5 }} />
      <div ref={edgeRightRef} className="absolute top-0 bottom-0 pointer-events-none" style={{ right: '49%', width: 2, background: 'linear-gradient(to bottom,transparent,rgba(207,154,62,0.85),transparent)', zIndex: 5 }} />
      <div ref={contentRef} className="relative" style={{ zIndex: 3, textAlign: 'center', padding: '0 24px' }}>
        <div ref={titleRef} style={{ fontSize: 28, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#e8b84b', letterSpacing: '0.06em', textShadow: '0 2px 16px rgba(207,154,62,0.5)' }}>{title}</div>
        <div ref={subtitleRef} style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)', marginTop: 8, letterSpacing: '0.05em' }}>{subtitle}</div>
      </div>
    </div>
  )
}

// V6: TYPEWRITER FRAME — 四角邊框同時向中心描繪，稱號逐字打出
export function TitleV6TypewriterFrame({ replay = 0, title = '登山王', subtitle = '完成所有山岳打卡' }: BaseProps) {
  const root = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cTLhRef = useRef<HTMLDivElement>(null)
  const cTLvRef = useRef<HTMLDivElement>(null)
  const cTRhRef = useRef<HTMLDivElement>(null)
  const cTRvRef = useRef<HTMLDivElement>(null)
  const cBLhRef = useRef<HTMLDivElement>(null)
  const cBLvRef = useRef<HTMLDivElement>(null)
  const cBRhRef = useRef<HTMLDivElement>(null)
  const cBRvRef = useRef<HTMLDivElement>(null)
  const titleContainerRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  useGSAP(() => {
    const titleCon = titleContainerRef.current!
    titleCon.innerHTML = ''
    const charEls = title.split('').map(c => {
      const span = document.createElement('span')
      span.textContent = c
      span.style.cssText = 'display:inline-block;opacity:0;'
      titleCon.appendChild(span)
      return span
    })
    const hLines = [cTLhRef.current, cTRhRef.current, cBLhRef.current, cBRhRef.current]
    const vLines = [cTLvRef.current, cTRvRef.current, cBLvRef.current, cBRvRef.current]
    gsap.set(overlayRef.current, { opacity: 0 })
    gsap.set(hLines, { scaleX: 0 })
    gsap.set(vLines, { scaleY: 0 })
    gsap.set(subtitleRef.current, { opacity: 0 })
    const tl = gsap.timeline()
    tl
      .to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      .to(hLines, { scaleX: 1, duration: 0.42, ease: 'power3.out', stagger: 0.04 }, '<0.12')
      .to(vLines, { scaleY: 1, duration: 0.42, ease: 'power3.out', stagger: 0.04 }, '<0.06')
      .to(charEls, { opacity: 1, duration: 0.05, stagger: 0.09 }, '<0.3')
      .to(cursorRef.current, { opacity: 0, duration: 0.12, repeat: 3, yoyo: true }, '<0.05')
      .to(cursorRef.current, { opacity: 0, duration: 0.1 })
      .to(subtitleRef.current, { opacity: 1, duration: 0.35 }, '<0.1')
  }, { scope: root, dependencies: [replay], revertOnUpdate: true })

  const amber = 'rgba(207,154,62,0.72)'
  const lineH = { width: 22, height: 1.5, borderRadius: 1, background: amber } as React.CSSProperties
  const lineV = { width: 1.5, height: 18, borderRadius: 1, background: amber } as React.CSSProperties

  return (
    <div ref={root} className="relative flex flex-col items-center justify-center" style={{ minHeight: 220, overflow: 'hidden', borderRadius: 16 }}>
      <div ref={overlayRef} className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg,rgba(12,18,38,0.93),rgba(18,24,46,0.96))', borderRadius: 'inherit', zIndex: 0 }} />
      <div className="absolute" style={{ top: 16, left: 16, zIndex: 2 }}>
        <div ref={cTLhRef} style={{ ...lineH, transformOrigin: 'left' }} />
        <div ref={cTLvRef} style={{ ...lineV, transformOrigin: 'top', position: 'absolute', top: 0, left: 0 }} />
      </div>
      <div className="absolute" style={{ top: 16, right: 16, zIndex: 2 }}>
        <div ref={cTRhRef} style={{ ...lineH, transformOrigin: 'right', marginLeft: 'auto' }} />
        <div ref={cTRvRef} style={{ ...lineV, transformOrigin: 'top', position: 'absolute', top: 0, right: 0 }} />
      </div>
      <div className="absolute" style={{ bottom: 16, left: 16, zIndex: 2 }}>
        <div ref={cBLhRef} style={{ ...lineH, transformOrigin: 'left' }} />
        <div ref={cBLvRef} style={{ ...lineV, transformOrigin: 'bottom', position: 'absolute', bottom: 0, left: 0 }} />
      </div>
      <div className="absolute" style={{ bottom: 16, right: 16, zIndex: 2 }}>
        <div ref={cBRhRef} style={{ ...lineH, transformOrigin: 'right', marginLeft: 'auto' }} />
        <div ref={cBRvRef} style={{ ...lineV, transformOrigin: 'bottom', position: 'absolute', bottom: 0, right: 0 }} />
      </div>
      <div className="relative" style={{ zIndex: 3, textAlign: 'center', padding: '0 32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <div ref={titleContainerRef} style={{ fontSize: 26, fontWeight: 900, fontFamily: 'var(--font-display)', color: '#e8b84b', letterSpacing: '0.08em' }} />
          <span ref={cursorRef} style={{ display: 'inline-block', width: 2, height: 26, background: '#e8b84b', borderRadius: 1, marginLeft: 2 }} />
        </div>
        <div ref={subtitleRef} style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)', marginTop: 8, letterSpacing: '0.05em' }}>{subtitle}</div>
      </div>
    </div>
  )
}
