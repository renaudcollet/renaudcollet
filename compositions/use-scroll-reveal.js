import gsap from 'gsap'

/**
 * Usage: 
 * Add 'scroll-reveal' class to the elements you want to animate on scroll
 * 
 * <div class="scroll-reveal" 
    data-scroll-reveal-opacity-y OR data-scroll-reveal-height OR data-scroll-reveal-clip-path
    data-scroll-reveal-delay="0.0"
    data-scroll-reveal-duration="0.5">Lorem ipsum dolor sit amet</div>
 */
export default function useScrollReveal() {

  let intersectionObserver = null

  function initScrollReveal(el) {
    if (!el) return;
    
      const targets = Array.from(el.querySelectorAll('.scroll-reveal'))
      if (targets.length === 0) return

      // Intersection Observer to trigger apparition of the logo on scroll
      intersectionObserver = new IntersectionObserver((entries) => {
        for(let i = 0; i < entries.length; i++) {
          const entry = entries[i]
          if (entry.isIntersecting || entry.intersectionRatio > 0) {

            const _duration = entry.target.dataset.scrollRevealDuration
            const _delay = entry.target.dataset.scrollRevealDelay
            if (entry.target.dataset.scrollRevealOpacityY !== undefined) {
              gsap.set(entry.target, {opacity: 0, y: 40})
              gsap.to(entry.target, {
                  duration: _duration,
                  opacity: 1,
                  y: 0,
                  delay: _delay,
                  ease: 'power2.outIn',
                  // onCompleteParams: [entry.target],
                  // onComplete: (target) => {
                  //   setTimeout(() => {
                  //     delete target.dataset.scrollRevealOpacityY
                  //     console.log('SCROLL REVEAL target', target);
                  //   }, 3000)
                  // }
              })
            } else if (entry.target.dataset.scrollRevealHeight !== undefined) {
              gsap.to(entry.target, {
                  duration: _duration,
                  delay: _delay,
                  height: 'auto'
              })
            } else if (entry.target.dataset.scrollRevealClipPath !== undefined) {
              gsap.to(entry.target, {
                  clipPath: entry.target.dataset.scrollRevealClipPath,
                  delay: _delay,
                  duration: _duration,
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