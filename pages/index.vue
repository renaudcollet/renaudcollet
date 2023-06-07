<template>
  <div>
    <div class="header">
      <img id="index-logo" class="logo" data-header-scroll-minimize src="~assets/svg/logo_groupie.svg" alt="">
    </div>
    <section class="projects-home">
      <template v-for="(item, index) in projects">
        <ProjectItem 
          class="projects-home__item" 
          :index="index" 
          :src="item.sections[0].blocks[3].value" 
          :to="`/work/${item.slug}`" 
          :title="item.sections[0].blocks[0].value"
          :subtitle="[item.sections[0].blocks[1].value, item.sections[0].blocks[2].value]" />
      </template>
    </section>
    <Footer :projects="projectsFooter" :footer="footer"></Footer>
  </div>  
</template>

<script>              
import scrollOpacity from '~~/mixins/scroll-opacity';
import utilsDevice from '~~/mixins/utils-device.js';
import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import { useDatasStore } from '~/stores/datas';
import gsap from 'gsap';

export default {
  components: {},

  setup() {
    const storeDatas = useDatasStore()
    const oSeo = storeDatas.seo.sections[0]

    // if used in async setup() , I can't use useHead() after receiving the data from the store in the default layout
    useHead({
      // titleTemplate: '%s - Accueil',
      titleTemplate: '%s',
      meta: [
        { name: "description", content: oSeo.blocks[0].value },
        { property: 'og:description', content: oSeo.blocks[0].value },
        { property: 'og:image', content: oSeo.blocks[1].value },
      ],
      // bodyAttrs: {
      //   class: 'test'
    })

    return {
      projects: storeDatas.projectsHome,
      projectsFooter: storeDatas.projectsFooterHome,
      footer: storeDatas.footer,
      seo: oSeo,
    }
  },

  data() {
    return {
      ioLogo: null,
    }
  },

  mounted() {
    gsap.set('#header-logo', { translateX: -20, opacity: 0 })
    gsap.set('#index-logo', { translateX: -20, opacity: 0 })
    gsap.to('#index-logo', { delay: 1, translateX: 0, opacity: 1 })

    this.initLogoObserver()
  },

  unmounted() {
    this.clearLogoObserver()
  },

  mixins: [
    scrollOpacity,
    utilsDevice,
    scrollHeaderMinimize
  ],

  methods: {
    initLogoObserver() {
      // header-logo is in Header.vue
      gsap.set('#header-logo', { autoAlpha: 0 })
      // Intersection Observer to trigger apparition of the logo on scroll
      this.ioLogo = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio === 0) {
          this.hideCoverLogo()
          this.showHeaderLogo()
        } else {
          this.hideHeaderLogo()
          this.showCoverLogo()
        }
      });
      this.ioLogo.observe(document.querySelector('#index-logo'));
    },
    clearLogoObserver() {
      this.ioLogo.disconnect();
    },
    hideHeaderLogo() {
      gsap.killTweensOf('#header-logo')
      gsap.to('#header-logo', {
        duration: 1,
        translateX: -20,
        autoAlpha: 0,
        ease: 'power4.out',
      })
    },
    showHeaderLogo() {
      gsap.killTweensOf('#header-logo')
      gsap.to('#header-logo', {
        duration: 1,
        translateX: 0,
        autoAlpha: 1,
        ease: 'power4.out',
      })
    },
    hideCoverLogo() {
      gsap.killTweensOf('#index-logo')
      gsap.to('#index-logo', { translateX: -20, opacity: 0 })
    },
    showCoverLogo() {
      gsap.killTweensOf('#index-logo')
      gsap.to('#index-logo', { delay: 0.3, translateX: 0, opacity: 1 })
    }
  },
};
</script>

<style lang="scss" scoped>
.header {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  pointer-events: none;
  position: relative;
  .logo{
    // margin-top: 200px;
    margin-bottom: 0;
    width: 170px;
    opacity: 0;
    position: absolute;
    bottom: 22%;
  }
}

@media only screen and (min-width: 768px) {
  .header {
    justify-content: left;
    margin-left: 20vw;
    width: calc(100% - 20vw);
    
    .logo{
      margin-top: 0px;
      width: 250px;
      position: relative;
      bottom: auto;
    }
  }
}

.projects-home {
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
  margin-top: 100px;
  z-index: $z-projects;
}
</style>