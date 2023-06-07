// import gsap from 'gsap'

/**
 * Usage: 
 * Add data-header-scroll-minimize to the element that will trigger the scroll
 * Important: One element per page
 */
export default {
  data() {
    return {
      ioHeaderMinimize: null,
    }
  },
  mounted() {
    // Need to use nextTick to be sure the DOM is loaded, specially for client-only components
    this.$nextTick(() => {
      this.initScrollHeaderMinimizeObserver()
    })
  },

  unmounted() {
    this.clearScrollHeaderMinimizeObserver()
  },

  methods: {
    initScrollHeaderMinimizeObserver() {
      const target = this.$el.querySelector('[data-header-scroll-minimize]')
      if (!target) return

      // Intersection Observer to trigger apparition of the logo on scroll
      this.ioHeaderMinimize = new IntersectionObserver((entries) => {
        // console.log(`'entries' ${entries[0].intersectionRatio}, ${entries[0].isIntersecting}`, entries)
        if (entries[0].isIntersecting || entries[0].intersectionRatio > 0) {
          this.maximizeLogo()
        } else {
          this.minimizeLogo()
        }
        // if (entries[0].intersectionRatio === 0) {
        //   this.minimizeLogo()
        // } else {
        //   this.maximizeLogo()
        // }
      });

      this.ioHeaderMinimize.observe(target, {
        root: null,
        rootMargin: '0px',
        threshold: 0.5,
      })
    },
    clearScrollHeaderMinimizeObserver() {
      // console.log('clearScrollHeaderMinimizeObserver')
      if (document.body.classList.contains('header-minimize'))
        document.body.classList.remove('header-minimize')
      if (this.ioHeaderMinimize)
        this.ioHeaderMinimize.disconnect();
    },

    minimizeLogo() {
      // console.log('minimizeLogo')
      document.body.classList.add('header-minimize')
    },
    maximizeLogo() {
      // console.log('MAXIMIZELogo')
      document.body.classList.remove('header-minimize')
    },
  },
};