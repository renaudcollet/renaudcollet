<template>
  <div :class="[currentPage]">
    <Header></Header>
    <Cover3D v-if="showCover" :position="coverPosition" :showScrollArrow="showScrollArrow"/>
    
    <Curtains id="CurtainsCanvas" @success="onReady" ref="curtains">
      <NuxtPage :scrollVelocity="scrollVelocity" />
    </Curtains>
    
    <span v-if="config" id="config"></span>
  </div>
</template>

<script>
import { Curtains } from "vue-curtains";
import Lenis from '@studio-freight/lenis';
import Cover3D from '~/components/webgl/Cover3D.vue'
import utilsDevice from '~~/mixins/utils-device.js';
// import { storeToRefs } from 'pinia';
import { useDatasStore } from '~/stores/datas';

export default {
  components: {
    Curtains,
    Cover3D
  },

  mixins: [utilsDevice],

  async setup () {

      // I don't know why, I can't use useHead() after receiving the data from the store
      useHead({
        // titleTemplate: '%s - Accueil',
        titleTemplate: '%s',
      })

    const curtainsParams = {
      // antialias: true,
      // premultipliedAlpha: true
    }

    let brew = `
                                                            
     .::.                                                   
     Y@@5                                                   
     5@@P  ..           .      ..                           
     5@@B5B&&B5~  JBBYJB&G .?PB###P7 YBBY   5BBB~  ^GBG:    
     5@@@P??5&@@? P@@@GJ?7~#@&?~~5@@5^&@@7 !@@@@B. G@@?     
     ~G@Y    7@@# 5@@G    P@@#GBBB&@@:~@@&^B@P?@@J7@@5      
       !J!^:~G@@P P@@5    ?@@#7~~7Y7^. J@@&@@^ P@@&@B.      
         ~5&@@#Y. 5@@5     !G&&B#&&P:   P@@@Y  :&@@&^       
           ^~^.   :^^:       !7J!^.      ^^^    :^^:        
                   .^!!~^..^?@@&~^^   .^!!~:    ^^^ :~!:    
                 .P&@#B&&7!&&@@@&&B ^5&&BG&@B7 :&@@G&@@?    
                 .?B@Y!7~  .!@@&^..^&@@J!!?&@@!.&@@G^::.    
     ^!!!!!!!!!!~   !B@@&G^ ~@@&.  7@@@GGGGGGG7.&@@~        
                      :5@@7 ^@@@577.P@@P7!7G5~ :@@@~        
                        ~!   7GB##G  ~YG###GY^ .GBG^        
                                                            
    `
    // console.log('%c' + brew, ' color: black; font-weight: bold; text-shadow: 5px 0 1px #f22e50, 10px 0 2px #db2b62, 15px 0 4px #ff3156;')
    
    const config = useRuntimeConfig()
    // console.log('API URL', config.public.apiUrl)

    const storeDatas = useDatasStore()
    const { fetchDatas } = storeDatas
    const datas = await fetchDatas(config.public.apiUrl)

    // console.log('ALREADY LOADED DATAS', storeDatas.datas)

    return {
      seo: storeDatas.seo,
    }
  },

  data() {
    return {
      scrollVelocity: 0,
      config: false,
      showScrollArrow: true
    };
  },

  computed: {
    currentPage() {
      return `page-${this.$route.name}`
    },
    showCover() {
      let route = this.$route.name
      if (route === 'legals')
        return false

      return true//route === 'home' || route === 'index'|| route === 'work'|| route === 'contact' || route === 'agence'
    },
    coverPosition() {
      let route = this.$route.name
      
      switch(route) {
        case 'contact':
        case 'agence':
        case 'work':
        case 'legal':
        case 'error-id':
          return 'left'
        default:
          return 'center'
      }
    }
  },

  watch: {
    '$route' (to, from) {
      // console.log('default layout - route changed', to, from)
      // if (window.gtag)
      //   window.gtag('page_view', to.name)

      const gtag = useGtag()
      gtag(
        'set', 'page_title', to.name
      )
        
      this.showScrollArrow = this.$route.name === 'index'
      this.lenis.scrollTo(0, 0)
    }
  },

  mounted() {
    // console.log(`CURTAINS`, this.$refs.curtains);
    // this.$refs.curtains.params.autoRender = false
    // // this.$refs.curtains.disableDrawing();
    // console.log(`CURTAINS`, this.$refs.curtains);
    // console.log(`CURTAINS`, this.$refs.curtains.curtainsInstance);

    console.log('SUPPORT CURTAINS ?', this.supportsCurtains)

    if (this.supportsCurtains)
      document.body.classList.add('supports-curtains')

    this.showScrollArrow = this.$route.name === 'index'

    const c1 = 1.70158;
    const c3 = c1 + 1;
    this.lenis = new Lenis({
      duration: 1,
      easing: (x) => {
        // return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
        return 1 + c3 * (x - 1) * (x - 1) * (x - 1) + c1 * (x - 1) * (x - 1);
      },
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 0.5, // This is not in the doc, but it sets the wheelMultiplier
      wheelMultiplier: 0.5, // if mouseMultiplier is not set, then wheelMultiplier is used
      // normalizeWheel: true,
      smoothTouch: false,
      touchMultiplier: 0.5,
    })
    this.scrollVelocity = 0
    this.lastScroll = this.lenis.scroll

    // Make Lenis available in every component
    window.lenis = this.lenis

    window.addEventListener('scroll', () => {
      this.scrollVelocity = this.lenis.scroll - this.lastScroll
      this.lastScroll = this.lenis.scroll
    })

    this.config = window.location.hash === '#config'
    requestAnimationFrame(this.update)
  },

  methods:{
    update(time){
      this.lenis.raf(time)
      this.scrollVelocity = this.lerp(this.scrollVelocity, 0, 0.2)
      requestAnimationFrame(this.update)
    },

    lerp(a, b, n) {
      return (1 - n) * a + n * b;
    },

    onReady(c) {

      // console.log(`CURTAINS READY`, c);
      // c.disableDrawing();


      c.autoResize = false
      let timeout = false
      window.addEventListener('resize', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          
          // Reload window if orientation changes
          // const isPortrait = window.innerHeight > window.innerWidth
          // if (this.isPortrait !== isPortrait) {
          //   window.location.reload()
          // }
          
          // Resize curtains
          c.resize()
        }, 110);
      })
    },

    easeOutBack(x) {
      const c1 = 1.70158;
      const c3 = c1 + 1;

      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    },
  }
};
</script>

<style lang="scss">
#CurtainsCanvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: $z-curtains;
}

#config{
  position: fixed;
  top: 0;
  right: 0;
  z-index: 99999999999;
}
</style>