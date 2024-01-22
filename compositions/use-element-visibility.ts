import type { MaybeRefOrGetter } from '@vueuse/shared'
import { ref } from 'vue-demi'
import type { MaybeComputedElementRef } from '@vueuse/core'
import { useIntersectionObserver } from '@vueuse/core'
import type { ConfigurableWindow } from '@vueuse/core'
import { defaultWindow } from '@vueuse/core'

export interface UseElementVisibilityOptions extends ConfigurableWindow {
  scrollTarget?: MaybeRefOrGetter<HTMLElement | undefined | null>
}

/**
 * Tracks the visibility of an element within the viewport.
 * 
 * Update by Renaud COLLET:
 *  - Add observer to return it, so it can be disconnected when needed
 *
 * @see https://vueuse.org/useElementVisibility
 */
export default function useElementVisibility(
  element: MaybeComputedElementRef,
  options: UseElementVisibilityOptions = {},
) {
  const { window = defaultWindow, scrollTarget } = options
  const elementIsVisible = ref(false)

  const observer = useIntersectionObserver(
    element,
    ([{ isIntersecting }]) => {
      elementIsVisible.value = isIntersecting
    },
    {
      root: scrollTarget,
      window,
      threshold: 0.3,
    },
  )

  return {isVisible: elementIsVisible, observer}
}