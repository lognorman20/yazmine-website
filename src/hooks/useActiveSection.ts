import { useEffect, useState } from 'react'

const DEFAULT_SECTION = '#hero'

export function useActiveSection(sectionIds: readonly string[]) {
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION)

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.querySelector(id))
      .filter((element): element is HTMLElement => element instanceof HTMLElement)

    if (sections.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)

        if (visible.length > 0) {
          setActiveSection(`#${visible[0].target.id}`)
        }
      },
      {
        rootMargin: '-40% 0px -45% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    for (const section of sections) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [sectionIds])

  return activeSection
}
