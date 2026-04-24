import Lenis from 'lenis'

declare global {
  interface Window {
    __lenis?: Lenis
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function initLenis(): void {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  })
  function raf(time: number): void {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  window.__lenis = lenis
}

/* ——— Scroll reveals: up (default), left, right ——— */
export function initReveal(): void {
  const elements = document.querySelectorAll<HTMLElement>('.reveal')

  if (prefersReducedMotion()) {
    elements.forEach((el) => {
      el.style.opacity = '1'
      el.style.transform = 'translate3d(0,0,0)'
    })
    return
  }

  // Set directional initial transform via inline style (higher specificity wins on reveal)
  elements.forEach((el) => {
    const dir = el.dataset.revealDir
    if (dir === 'left') el.style.transform = 'translateX(40px)'
    else if (dir === 'right') el.style.transform = 'translateX(-40px)'
    // 'up' uses CSS class default (translateY(28px))
  })

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement
          // Set final state inline so it overrides any directional inline transform
          el.style.opacity = '1'
          el.style.transform = 'translate3d(0,0,0)'
          el.classList.add('reveal-visible')
          obs.unobserve(el)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -60px 0px' },
  )

  elements.forEach((el) => obs.observe(el))
}

/* ——— Skill cards: combined reveal + hover state via .in-view class ——— */
export function initSkillCards(): void {
  if (prefersReducedMotion()) {
    document.querySelectorAll<HTMLElement>('.skill-card').forEach((el) => {
      el.classList.add('in-view')
    })
    return
  }

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          ;(entry.target as HTMLElement).classList.add('in-view')
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.12 },
  )

  document
    .querySelectorAll<HTMLElement>('.skill-card')
    .forEach((el) => obs.observe(el))
}

/* ——— Hero ambient: floating cards + glow orb + content 3D parallax ——— */
export function initHeroAmbient(): void {
  if (prefersReducedMotion()) return

  const cards = Array.from(
    document.querySelectorAll<HTMLElement>('.hero-tech-card'),
  )
  const orb = document.getElementById('hero-glow-orb')
  const mouse = { x: 0.5, y: 0.5 }

  window.addEventListener(
    'mousemove',
    (e) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    },
    { passive: true },
  )

  let start = 0

  function tick(now: number): void {
    if (!start) start = now
    const t = (now - start) / 1000

    cards.forEach((card, i) => {
      const baseX = parseFloat(card.dataset.baseX ?? '0')
      const baseY = parseFloat(card.dataset.baseY ?? '0')
      const baseZ = parseFloat(card.dataset.baseZ ?? '0')
      const baseScale = parseFloat(card.dataset.baseScale ?? '1')
      const floatY = Math.sin(t * 0.8 + i * 1.2) * 12
      const rotY = Math.sin(t * 0.5 + i) * 5
      const mx = (mouse.x - 0.5) * 40 * (i % 2 === 0 ? 1 : -0.7)
      const my = (mouse.y - 0.5) * 25 * (i % 2 === 0 ? 1 : -0.7)
      card.style.transform = `translate3d(${baseX + mx}px, ${baseY + floatY + my}px, ${baseZ}px) rotateY(${rotY}deg) scale(${baseScale})`
    })

    if (orb) {
      orb.style.left = `${mouse.x * 100}%`
      orb.style.top = `${mouse.y * 100}%`
    }

    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

/* ——— Magnetic hover: element follows cursor slightly ——— */
export function initMagnetic(): void {
  if (prefersReducedMotion()) return

  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic ?? '0.3')
    let cx = 0
    let cy = 0

    el.addEventListener('mouseenter', () => {
      // Reset transform before reading rect so we get the true original position
      el.style.transition = 'none'
      el.style.transform = 'translate3d(0,0,0)'
      el.style.cursor = 'pointer'
      const rect = el.getBoundingClientRect()
      cx = rect.left + rect.width / 2
      cy = rect.top + rect.height / 2
    })

    el.addEventListener('mousemove', (e) => {
      el.style.cursor = 'pointer'
      const x = (e.clientX - cx) * strength
      const y = (e.clientY - cy) * strength
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
    })

    el.addEventListener('mouseleave', () => {
      el.style.cursor = 'auto'
      el.style.transition = 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1)'
      el.style.transform = 'translate3d(0,0,0)'
    })
  })
}

/* ——— Project 3D tilt (matches design system: ±12° Y, ±8° X) ——— */
export function initProjectTilt(): void {
  if (prefersReducedMotion()) return

  document.querySelectorAll<HTMLElement>('.tilt-3d').forEach((card) => {
    const glare = card.querySelector<HTMLElement>('.tilt-glare')

    const onMove = (e: MouseEvent): void => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const rotY = (x - 0.5) * 12
      const rotX = (y - 0.5) * -8
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02,1.02,1.02)`
      if (glare) {
        glare.style.opacity = '1'
        glare.style.background = `radial-gradient(circle at ${Math.round(x * 100)}% ${Math.round(y * 100)}%, rgba(255,255,255,0.14), transparent 60%)`
      }
    }

    const onLeave = (): void => {
      card.style.transform =
        'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)'
      if (glare) glare.style.opacity = '0'
    }

    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)
  })
}

export function initAnimations(): void {
  initLenis()
  initReveal()
  initSkillCards()
  initHeroAmbient()
  initMagnetic()
  initProjectTilt()
}
