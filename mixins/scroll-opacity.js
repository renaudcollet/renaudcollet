// import gsap from 'gsap'

/**
 * Usage: 
 * Add 'scroll-opacity' class to the elements you want to animate on scroll
 * Add 'data-scroll-index' attribute to the elements to delay the animation
 * 
 * <div class="scroll-opacity" data-scroll-index="0">Lorem ipsum dolor sit amet</div>
 * <div class="scroll-opacity" data-scroll-index="1">Lorem ipsum dolor sit amet</div>
 */
export default {
  data() {
    return {
      intersectionObserver: null,
    }
  },
  mounted() {
    // Need to use nextTick to be sure the DOM is loaded, specially for client-only components
    this.$nextTick(() => {
      this.initScrollObserver()
    })
  },

  unmounted() {
    this.clearScrollObserver()
  },

  methods: {
    initScrollObserver() {
      // console.log('SCROLL OPACITY', this.$el.querySelectorAll('.scroll-opacity'))

      const targets = Array.from(this.$el.querySelectorAll('.scroll-opacity'))
      if (targets.length === 0) return

      // gsap.set(targets, { opacity: 0, y: '+=40' })

      // Intersection Observer to trigger apparition of the logo on scroll
      this.intersectionObserver = new IntersectionObserver((entries) => {
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
            
            this.intersectionObserver.unobserve(entry.target);
          }
        }
      });

      targets.forEach(target => {
        this.intersectionObserver.observe(target, {
          // threshold: 1,
          rootMargin: '-100px 0px -100px 0px',
          // root: document.body
        })
      })
    },
    clearScrollObserver() {
      if (this.intersectionObserver)
        this.intersectionObserver.disconnect();
    },
  },
};