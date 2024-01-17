<template>
  <div class="mousecursor">
    <svg
      class="outline"
      x="0px"
      y="0px"
      width="105px"
      height="105px"
      viewBox="0 0 105 105" 
    >
      <g>
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
      x="0px"
      y="0px"
      width="105px"
      height="105px"
      viewBox="0 0 105 105" 
    >
      <g>
        <polygon 
          class="small" 
          points="48.2,64.2 52.5,55.8 56.8,64.2"
          fill-opacity="0.5"
          shape-rendering="geometricPrecision"
        />
      </g>
    </svg>
    <svg class="zoom zoom-in" x="0px" y="0px" width="143" height="143" viewBox="0 0 143 143">
      <polygon class="bg" points="30.7,108.8 72,33.1 113.3,108.8 "/>
      <g>
        <rect x="57.9" y="79.2" class="plus" width="28.2" height="1.4"/>
        <g>
          <rect x="71.3" y="66.2" class="plus" width="1.4" height="13.8"/>
          <rect x="71.3" y="79.9" class="plus" width="1.4" height="13.8"/>
        </g>
      </g>
    </svg>
    <svg class="zoom zoom-out" x="0px" y="0px" width="143" height="143" viewBox="0 0 143 143">
      <polygon class="bg" points="30.7,108.8 72,33.1 113.3,108.8 "/>
      <g>
        <rect x="57.9" y="79.2" class="plus" width="28.2" height="1.4"/>
      </g>
    </svg>
  </div>
</template>

<script>
import { gsap, Power2 } from 'gsap'

export default {
  name: 'MouseCursor',
  defineExpose() {
    return {
      reset: this.reset
    }
  },
  data() {
    return {
      mouseContainer: null,
      mouseSVGOutline: null,
      mouseSVGCenter: null,
      mouseSVGZoomIn: null,
      isMounted: false,
      hasMouseMoved: false,
      isMobileOrTablet : true,

      oTweenOutlineBigShow: {
        delay: 0,
        duration: 0.5,
        rotation: 0,
        scale: 1,
        opacity: 1,
        attr: { 'stroke-opacity': 0.3 },
        ease: Power2.easeInOut
      },

      oTweenOutlineBigHoverFrom: {
        opacity: 1,
        rotation: 0,
        scale: 1,
        attr: {   
          'stroke': '#FFFFFF',
          'stroke-width': 1,
          'fill': '#000',
          'fill-opacity': 0.1,
          'stroke-opacity': 1
        },
      },
      oTweenOutlineBigHover: {
        delay: 0,
        duration: 0.85,
        scale: 0.5,
        rotation: 45,
        attr: { 
          'stroke-opacity': 0.5,
          'stroke-width': 1
        },
        opacity: 0,
        yoyo: true,
        repeat: -1
      },
      oTweenOutlineBigHide: {},
      
      
      oTweenCenterSmallShowFrom: {
        rotation: 0,
        scale: 1,
        opacity: 1,
        attr: { 
          'stroke-opacity': 1,
          'stroke-width': 1
        }
      },
      oTweenCenterSmallShow: {
        delay: 0,
        duration: 0.5,
        rotation: 0,
        scale: 1,
        opacity: 1,
        attr: { 
          'stroke-opacity': 1,
          'stroke-width': 1
        },
        ease: Power2.easeInOut
      },
      oTweenCenterSmallHover: {
        delay: 0,
        duration: 0.85,
        opacity: 1,
        attr: {
          // 'stroke-opacity': 0.8,
          'stroke-width': 0.1
        },
        scale: 2,
        yoyo: true,
        repeat: -1
      },
      oTweenCenterSmallHide: {},
    }
  },
  mounted() {
    // if (!this.isServer) {
      this.isMounted = true

      // Detect if mobile or tablet device
      if (window.innerWidth < 1024) {
        this.isMobileOrTablet = true
      } else {
        this.isMobileOrTablet = false
      }


      this.mouseContainer = document.querySelector('.mousecursor')
      this.mouseSVGOutline = document.querySelector('.mousecursor svg.outline')
      this.mouseSVGOutlineBig = document.querySelector(
        '.mousecursor svg.outline .big'
      )
      this.mouseSVGCenter = document.querySelector('.mousecursor svg.center')
      this.mouseSVGCenterSmall = document.querySelector(
        '.mousecursor svg.center .small'
      )
      this.mouseSVGZoomIn = document.querySelector('.mousecursor svg.zoom-in')
      // this.mouseSVGZoomOut = document.querySelector('.mousecursor svg.zoom-out')

      gsap.set(this.mouseSVGOutlineBig, {
        attr: { 
          'stroke': '#FFFFFF',
          'stroke-width': 1,
          'fill': '#000',
          'fill-opacity': 0.1,
          'stroke-opacity': 1
        },
        transformOrigin: '50% 50%',
      })

      gsap.set(this.mouseSVGCenterSmall, {
        transformOrigin: '50% 50%',
        // attr: {
        //   r: 1
        // },
        // strokeWidth: 5
      })

      gsap.set(this.mouseSVGZoomIn, {
        opacity: 0,
        display: 'none',
        transformOrigin: '50% 50%'
      })

      document.addEventListener('mousedown', (e) => {
        // console.log(`GET GLOBAL MOUSE DOWN`, e)
        if (
          e.target.tagName === 'A' ||
          e.target.tagName === 'BUTTON' ||
          e.target.dataset.mouseCursor === 'hover'
        ) {
          gsap.killTweensOf(this.mouseSVGOutlineBig)
          gsap.to(this.mouseSVGOutlineBig, {
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
          e.target.dataset.mouseCursor === 'hover'
        ) {
          gsap.killTweensOf(this.mouseSVGOutlineBig)
          gsap.to(this.mouseSVGOutlineBig, {
            duration: 0.3,
            delay: 0.2,
            scale: 1.2,
          })
        }
      })

      document.addEventListener('mouseover', (e) => {
        // console.log(`GET GLOBAL MOUSE OVER`, e.target.tagName)
        if (
          e.target.tagName === 'A' ||
          e.target.tagName === 'BUTTON' ||
          e.target.dataset.mouseCursor === 'hover'
        ) {
          gsap.killTweensOf(this.mouseSVGOutlineBig)
          gsap.fromTo (
            this.mouseSVGOutlineBig,
            this.oTweenOutlineBigHoverFrom,
            this.oTweenOutlineBigHover
          )

          gsap.killTweensOf(this.mouseSVGCenterSmall)
          gsap.fromTo(
            this.mouseSVGCenterSmall,
            this.oTweenCenterSmallShowFrom,
            this.oTweenCenterSmallHover
          )
        } else if (
          e.target.dataset.mouseCursor === 'hide'
        ) {
          gsap.killTweensOf(this.mouseSVGOutlineBig)
          gsap.to(
            this.mouseSVGOutlineBig,
            {
              opacity: 0,
            },
          )

          gsap.killTweensOf(this.mouseSVGCenterSmall)
          gsap.to(
            this.mouseSVGCenterSmall,
            {
              opacity: 0,
            },
          )
        } else if (
          e.target.dataset.mouseCursor === 'zoom'
        ) {
          // console.log('MOUSE OVER ZOOM IN');
          gsap.killTweensOf(this.mouseSVGOutlineBig)
          gsap.to(
            this.mouseSVGOutlineBig,
            {
              opacity: 0,
            },
          )

          gsap.killTweensOf(this.mouseSVGCenterSmall)
          gsap.to(
            this.mouseSVGCenterSmall,
            {
              opacity: 0,
            },
          )

          gsap.killTweensOf(this.mouseSVGZoomIn)
          gsap.fromTo(
            this.mouseSVGZoomIn,
            {
              opacity: 1,
              scale: 1,
            },
            {
              display: 'block',
              opacity: 1,
              scale: 1.2,
              repeat: -1,
              yoyo: true,
            },
          )
        } else if (
          e.target.dataset.mouseCursor === 'zoom-out'
        ) {
          // console.log('MOUSE OVER ZOOM OUT');
          gsap.killTweensOf(this.mouseSVGOutlineBig)
          gsap.to(
            this.mouseSVGOutlineBig,
            {
              opacity: 0,
            },
          )

          gsap.killTweensOf(this.mouseSVGCenterSmall)
          gsap.to(
            this.mouseSVGCenterSmall,
            {
              opacity: 0,
            },
          )

          gsap.killTweensOf(this.mouseSVGZoomIn)
          gsap.to(
            this.mouseSVGZoomIn,
            {
              display: 'none',
              opacity: 0,
            },
          )
        } else {
          // Reset to mouseout state
          gsap.killTweensOf(this.mouseSVGOutlineBig)
          gsap.to(
            this.mouseSVGOutlineBig, 
            this.oTweenOutlineBigShow
          )

          gsap.killTweensOf(this.mouseSVGCenterSmall)
          gsap.to(
            this.mouseSVGCenterSmall, 
            this.oTweenCenterSmallShow
          )
        }
      })

      document.addEventListener('mouseout', (e) => {
        // console.log(`GET GLOBAL MOUSE OVER`, e)
        if (
          e.target.tagName === 'A' ||
          e.target.tagName === 'BUTTON' ||
          e.target.dataset.mouseCursor === 'hover' ||
          e.target.dataset.mouseCursor === 'hide'
        ) {
          gsap.killTweensOf(this.mouseSVGOutlineBig)
          gsap.to(
            this.mouseSVGOutlineBig, 
            this.oTweenOutlineBigShow
          )

          gsap.killTweensOf(this.mouseSVGCenterSmall)
          gsap.to(
            this.mouseSVGCenterSmall, 
            this.oTweenCenterSmallShow
          )
        } else if (
          e.target.dataset.mouseCursor === 'zoom'
        ) {
          // console.log('MOUSE OUT ZOOM');
          
          gsap.killTweensOf(this.mouseSVGOutlineBig)
          gsap.to (
            this.mouseSVGOutlineBig,
            this.oTweenOutlineBigShow
          )

          gsap.killTweensOf(this.mouseSVGCenterSmall)
          gsap.to(
            this.mouseSVGCenterSmall,
            this.oTweenCenterSmallShow
          )

          gsap.killTweensOf(this.mouseSVGZoomIn)
          gsap.to(
            this.mouseSVGZoomIn,
            {
              display: 'none',
              opacity: 0,
            },
          )
        }
      })
      document.addEventListener('mousemove', this.onMouseMove)
    // }
  },
  methods: {
    reset() {
      gsap.killTweensOf(this.mouseSVGOutlineBig)
      gsap.to(
        this.mouseSVGOutlineBig, 
        this.oTweenOutlineBigShow
      )

      gsap.killTweensOf(this.mouseSVGCenterSmall)
      gsap.to(
        this.mouseSVGCenterSmall, 
        this.oTweenCenterSmallShow
      )

      gsap.killTweensOf(this.mouseSVGZoomIn)
      gsap.to(
        this.mouseSVGZoomIn,
        {
          display: 'none',
          opacity: 0,
        },
      )
    },
    onMouseMove(e) {
      // console.log(`onMouseMove`, e)
      // TODO: Draw triangle in the shader

      if (!this.isMobileOrTablet && !this.hasMouseMoved) {
        this.hasMouseMoved = true
        this.mouseContainer.style.display = 'block'
      }

      gsap.set(this.mouseSVGCenter, {
        // duration: 0.1,
        opacity: 1,
        x: e.clientX - 20, // / window.innerWidth,
        y: e.clientY - 30 // / window.innerHeight
      })

      gsap.to(this.mouseSVGOutline, {
        duration: 0.7,
        x: e.clientX - 20, // / window.innerWidth,
        y: e.clientY - 28, // / window.innerHeight,
        ease: Power2.easeOut(0.5)
      })

      gsap.to(this.mouseSVGZoomIn, {
        // duration: 0.7,
        x: e.clientX - 40, // / window.innerWidth,
        y: e.clientY - 51, // / window.innerHeight,
        ease: Power2.easeOut(0.5)
      })
    },

  }
}
</script>

<style lang="scss">
@include media-breakpoint-up(md) {
  body,
  a,
  button,
  [data-mouse-cursor='hover']
  {
      cursor: none !important;
  }

  [data-mouse-cursor='hide'],
  [data-mouse-cursor='zoom']
  {
      cursor: none !important;
      & > * {
          pointer-events: none;
      }
  }
}
</style>

<style scoped lang="scss">
.big{
  stroke: #FFFFFF;
  stroke-width: 1;
  fill: #000;
  fill-opacity: 0.0;
}
.small{
  stroke:#FFFFFF;
  stroke-width:2;
}

.zoom {
  display: none;

  .bg {
    fill: #000;
    fill-opacity: 0.5;
    stroke: #FFFFFF;
    stroke-width: 1;
  }

  .plus {
    fill: #FFFFFF;
  }
}

.mousecursor {
  display: none;

  @include media-breakpoint-up(md) {
    position: fixed;
    z-index: 10001;
    pointer-events: none;
    left: -31px;
    top: -31px;
    // mix-blend-mode: difference;
    filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));
    // &.mounted {
    //   display: block;
    // }
    svg {
      position: absolute;
    }
  }
}
</style>
