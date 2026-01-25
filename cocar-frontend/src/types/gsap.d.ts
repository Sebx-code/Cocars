declare module 'gsap' {
  export const gsap: {
    to: (target: unknown, vars: object) => unknown
    fromTo: (target: unknown, fromVars: object, toVars: object) => unknown
    from: (target: unknown, vars: object) => unknown
    timeline: (vars?: object) => {
      to: (target: unknown, vars: object, position?: string | number) => unknown
      fromTo: (target: unknown, fromVars: object, toVars: object, position?: string | number) => unknown
      from: (target: unknown, vars: object, position?: string | number) => unknown
    }
    context: (func: () => void) => { revert: () => void }
    registerPlugin: (...plugins: unknown[]) => void
  }
  export { gsap }
}

declare module 'gsap/ScrollTrigger' {
  export const ScrollTrigger: {
    create: (vars: {
      trigger?: unknown
      start?: string
      end?: string
      onEnter?: () => void
      onLeave?: () => void
      onEnterBack?: () => void
      onLeaveBack?: () => void
      once?: boolean
      scrub?: boolean | number
      pin?: boolean | string
      markers?: boolean
    }) => unknown
  }
}
