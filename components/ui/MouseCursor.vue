<template>
  <div class="mousecursor" :class="{ mounted: isMounted }">
    <svg
      class="outline"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="105px"
      height="105px"
      viewBox="0 0 105 105" 
      xml:space="preserve"
    >
      <g id="outline">
        <polygon 
          class="big" 
          points="20,82.5 52.5,17.5 85,82.5"
          fill-opacity="0.5"
          shape-rendering="geometricPrecision"
        />
      </g>
    </svg>
    <svg
      class="center"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      width="105px"
      height="105px"
      viewBox="0 0 105 105" 
      xml:space="preserve"
    >
      <g id="center">
        <polygon 
          class="small" 
          points="48.2,64.2 52.5,55.8 56.8,64.2"
          fill-opacity="0.5"
          shape-rendering="geometricPrecision"
        />
      </g>
    </svg>

  </div>
</template>

<script>
import { gsap, Power2 } from 'gsap'

export default {
  name: 'MouseCursor',
  data() {
    return {
      mouseContainer: null,
      mouseSVGOutline: null,
      mouseSVGCenter: null,
      isMounted: false
    }
  },
  mounted() {
    if (!this.isServer) {
      this.isMounted = true
      this.mouseContainer = document.querySelector('.mousecursor')
      this.mouseSVGOutline = document.querySelector('.mousecursor svg.outline')
      this.mouseSVGOutlineCircle = document.querySelector(
        '.mousecursor svg.outline .big'
      )
      this.mouseSVGCenter = document.querySelector('.mousecursor svg.center')
      this.mouseSVGCenterCircle = document.querySelector(
        '.mousecursor svg.center .small'
      )

      gsap.set(this.mouseSVGOutlineCircle, {
        // fill: '#ffffff',
        // fillOpacity: 0.05
        attr: { 'stroke-opacity': 0.3 },
        transformOrigin: 'center center',
      })

      gsap.set(this.mouseSVGCenterCircle, {
        transformOrigin: 'center center',
        // attr: {
        //   r: 1
        // },
        // strokeWidth: 5
      })

      document.addEventListener('mousedown', (e) => {
        // console.log(`GET GLOBAL MOUSE DOWN`, e)
        if (
          e.target.tagName === 'A' ||
          e.target.tagName === 'BUTTON' ||
          e.target.dataset.cursor === 'hover'
        ) {
          gsap.killTweensOf(this.mouseSVGOutlineCircle)
          gsap.to(this.mouseSVGOutlineCircle, {
            duration: 0.3,
            scale: .8,
          })
        }
      })

      document.addEventListener('mouseup', (e) => {
        // console.log(`GET GLOBAL MOUSE UP`, e)
        if (
          e.target.tagName === 'A' ||
          e.target.tagName === 'BUTTON' ||
          e.target.dataset.cursor === 'hover'
        ) {
          gsap.killTweensOf(this.mouseSVGOutlineCircle)
          gsap.to(this.mouseSVGOutlineCircle, {
            duration: 0.3,
            delay: 0.2,
            scale: 1.2,
          })
        }
      })

      document.addEventListener('mouseover', (e) => {
        console.log(`GET GLOBAL MOUSE OVER`, e.target.tagName)
        if (
          e.target.tagName === 'A' ||
          e.target.tagName === 'BUTTON' ||
          e.target.dataset.cursor === 'hover'
        ) {
          gsap.killTweensOf(this.mouseSVGOutlineCircle)
          gsap.fromTo(
            this.mouseSVGOutlineCircle,
            {
              scale: 1,
              rotation: 0,
              attr: { 
                'stroke-opacity': 1,
                'stroke-width': 1
              },
            },
            {
              delay: 0,
              duration: 0.85,
              scale: 0.5,
              rotation: 45,
              attr: { 
                'stroke-opacity': 0.5,
                'stroke-width': 1
              },
              yoyo: true,
              repeat: -1
            }
          )

          gsap.killTweensOf(this.mouseSVGCenter)
          gsap.fromTo(
            this.mouseSVGCenter,
            {
              scale: 1,
              rotation: 0,
              attr: { 
                'stroke-opacity': 0.3,
                'stroke-width': 0.5
             },
            },
            {
              delay: 0,
              duration: 0.85,
              attr: {
                'stroke-opacity': 0.8,
                'stroke-width': 0.5
              },
              // yoyo: true,
              // repeat: -1
            }
          )
        }
      })
      document.addEventListener('mouseout', (e) => {
        // console.log(`GET GLOBAL MOUSE OVER`, e)
        if (
          e.target.tagName === 'A' ||
          e.target.tagName === 'BUTTON' ||
          e.target.dataset.cursor === 'hover'
        ) {
          gsap.killTweensOf(this.mouseSVGOutlineCircle)
          gsap.to(this.mouseSVGOutlineCircle, {
            delay: 0,
            duration: 0.5,
            rotation: 0,
            scale: 1,
            attr: { 'stroke-opacity': 0.3 },
            ease: Power2.easeInOut
          })

          gsap.killTweensOf(this.mouseSVGCenter)
          gsap.to(this.mouseSVGCenter, {
            delay: 0,
            duration: 0.5,
            rotation: 0,
            scale: 1,
            attr: { 
              'stroke-opacity': 1,
              'stroke-width': 1
            },
            ease: Power2.easeInOut
          })
        }
      })
      document.addEventListener('mousemove', this.onMouseMove)
    }
  },
  methods: {
    onMouseMove(e) {
      // console.log(`onMouseMove`, e)
      gsap.set(this.mouseSVGCenter, {
        // duration: 0.1,
        x: e.clientX - 20, // / window.innerWidth,
        y: e.clientY - 30 // / window.innerHeight
      })

      gsap.to(this.mouseSVGOutline, {
        duration: 0.7,
        x: e.clientX - 20, // / window.innerWidth,
        y: e.clientY - 28, // / window.innerHeight,
        ease: Power2.easeOut(0.5)
      })
    }
  }
}
</script>

<style lang="scss">
#__nuxt,
#__nuxt a,
#__nuxt button,
#__nuxt [data-cursor='hover']
{
    cursor: none !important;
}
</style>

<style scoped lang="scss">
.big{
  stroke:#FFFFFF;
  stroke-width:1;
}
.small{
  stroke:#FFFFFF;
  stroke-width:2;
}

.mousecursor {
  display: none;

  .has-touch & {
    display: none !important;
  }

  @include media-breakpoint-up(md) {
    position: fixed;
    z-index: 10001;
    pointer-events: none;
    left: -31px;
    top: -31px;
    mix-blend-mode: difference;
    &.mounted {
      display: block;
    }
    svg {
      position: absolute;
    }
  }
}
</style>
