<template>
  <div>
    <div class="header">
      <img id="index-logo" class="logo" data-header-scroll-minimize src="~assets/svg/logo_groupie.svg" alt="">
    </div>
    <section class="projects-home">
      <template v-for="(item, index) in datasProjets">
        <ProjectItem 
          class="projects-home__item" 
          :index="index" 
          :src="item.attributes.cover.data.attributes.formats" 
          :to="`/work/${item.attributes.slug}`" 
          :title="item.attributes.titre"
          :keywords="item.attributes.keywords.data" />
      </template>
    </section>
    <!-- <Footer :projects="projectsFooter" :footer="footer"></Footer> -->
  </div>  
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_PROJECTS } from '~/stores/datas';
import gsap from 'gsap';

// import scrollOpacity from '~~/mixins/scroll-opacity';
// import utilsDevice from '~~/mixins/utils-device.js';
// import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);
await fetchDatas(S_DATA_PROJECTS);

const datasAccueil = storeDatas.accueil.data.attributes;
const datasProjets = storeDatas.projects.data;

console.log('datasProjets', datasProjets);

let ioLogo = null;

onMounted(() => {
  gsap.set('#header-logo', { translateX: -20, opacity: 0 })
  gsap.set('#index-logo', { translateX: -20, opacity: 0 })
  gsap.to('#index-logo', { delay: 1, translateX: 0, opacity: 1 })

  // this.initLogoObserver()
})

onUnmounted(() => {
  // this.clearLogoObserver()
})


const initLogoObserver = () => {
  // header-logo is in Header.vue
  gsap.set('#header-logo', { autoAlpha: 0 })
  // Intersection Observer to trigger apparition of the logo on scroll
  ioLogo = new IntersectionObserver((entries) => {
    if (entries[0].intersectionRatio === 0) {
      this.hideCoverLogo()
      this.showHeaderLogo()
    } else {
      this.hideHeaderLogo()
      this.showCoverLogo()
    }
  });
  ioLogo.observe(document.querySelector('#index-logo'));
}
const clearLogoObserver = () => {
  ioLogo.disconnect();
}
const hideHeaderLogo = () => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', {
    duration: 1,
    translateX: -20,
    autoAlpha: 0,
    ease: 'power4.out',
  })
}
const showHeaderLogo = () => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', {
    duration: 1,
    translateX: 0,
    autoAlpha: 1,
    ease: 'power4.out',
  })
}
const hideCoverLogo = () => {
  gsap.killTweensOf('#index-logo')
  gsap.to('#index-logo', { translateX: -20, opacity: 0 })
}
const showCoverLogo = () => {
  gsap.killTweensOf('#index-logo')
  gsap.to('#index-logo', { delay: 0.3, translateX: 0, opacity: 1 })
}
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