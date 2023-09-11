// import gsap from 'gsap'
import {ref} from 'vue';


/**
 * Usage: 
 * Add 'scroll-opacity' class to the elements you want to animate on scroll
 * Add 'data-scroll-index' attribute to the elements to delay the animation
 * 
 * <div class="scroll-opacity" data-scroll-index="0">Lorem ipsum dolor sit amet</div>
 * <div class="scroll-opacity" data-scroll-index="1">Lorem ipsum dolor sit amet</div>
 */
export default function useScrollOpacity() {

  // const intersectionObserver = ref(null)
  let intersectionObserver = null

  function initScrollOpacity(el) {
      const targets = Array.from(el.querySelectorAll('.scroll-opacity'))
      if (targets.length === 0) return

      // gsap.set(targets, { opacity: 0, y: '+=40' })

      // Intersection Observer to trigger apparition of the logo on scroll
      intersectionObserver = new IntersectionObserver((entries) => {
        for(let i = 0; i < entries.length; i++) {
          const entry = entries[i]
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            let index = entry.target.dataset.scrollIndex
            if (!index) index = 0
            // GSAP animation
            // gsap.to(entry.target, {
            //   duration: 1,
            //   delay: index * 0.3 + 0.5,
            //   opacity: 1,
            //   y: 0,
            //   ease: 'power4.outIn',
            // })

            // CSS animation
            entry.target.classList.add('scroll-opacity--show')
            
            intersectionObserver.unobserve(entry.target);
          }
        }
      });

      targets.forEach(target => {
        intersectionObserver.observe(target, {
          // threshold: 1,
          rootMargin: '-100px 0px -100px 0px',
          // root: document.body
        })
      })
    }
    function clearScrollOpacity() {
      if (intersectionObserver)
        intersectionObserver.disconnect();
    }

    return {
      initScrollOpacity,
      clearScrollOpacity
    }
};