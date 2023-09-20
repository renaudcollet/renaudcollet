import gsap from 'gsap'

/**
 * Usage: 
 * Add 'scroll-opacity' class to the elements you want to animate on scroll
 * Add 'data-scroll-index' attribute to the elements to delay the animation
 * 
 * <div class="scroll-opacity" data-scroll-index="0">Lorem ipsum dolor sit amet</div>
 * <div class="scroll-opacity" data-scroll-index="1">Lorem ipsum dolor sit amet</div>
 */
export default function useScrollReveal() {

  let intersectionObserver = null

  function initScrollReveal(el) {
      const targets = Array.from(el.querySelectorAll('.scroll-reveal'))
      if (targets.length === 0) return

      console.log('initScrollReveal', targets)

      // Intersection Observer to trigger apparition of the logo on scroll
      intersectionObserver = new IntersectionObserver((entries) => {
        for(let i = 0; i < entries.length; i++) {
          const entry = entries[i]
          if (entry.isIntersecting || entry.intersectionRatio > 0) {

            if (entry.target.dataset.scrollRevealOpacityY !== undefined) {
              gsap.set(entry.target, {opacity: 0, y: 40})
              gsap.to(entry.target, {
                  duration: entry.target.dataset.scrollRevealDuration,
                  opacity: 1,
                  y: 0,
                  delay: entry.target.dataset.scrollRevealDelay,
                  ease: 'power2.outIn'
              })
            } else if (entry.target.dataset.scrollRevealHeight !== undefined) {
              gsap.to(entry.target, {
                  duration: entry.target.dataset.scrollRevealDelay,
                  delay: entry.target.dataset.scrollRevealDelay,
                  height: 'auto'
              })
            } else if (entry.target.dataset.scrollRevealClipPath !== undefined) {
              gsap.to(entry.target, {
                  clipPath: entry.target.dataset.scrollRevealClipPath,
                  delay: entry.target.dataset.scrollRevealDelay,
                  duration: entry.target.dataset.scrollRevealDuration,
                  ease: 'power2.inOut'
              })
            }
            
            intersectionObserver.unobserve(entry.target);
          }
        }
      });

      targets.forEach(target => {
        intersectionObserver.observe(target, {
          // threshold: 1,
          rootMargin: '-200px 0px -100px 0px',
          // root: document.body
        })
      })
    }
    function clearScrollReveal() {
      if (intersectionObserver)
        intersectionObserver.disconnect();
    }

    return {
      initScrollReveal,
      clearScrollReveal
    }
};