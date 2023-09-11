<template>
  <div ref="root">
    <div class="header">
      <img id="index-logo" class="logo" data-header-scroll-minimize src="~assets/svg/logo_groupie.svg" alt="">
    </div>
    <section class="projects-home">
      <template v-for="(item, index) in datasProjets">
        <ProjectItem 
          class="projects-home__item" 
          :id="index" 
          :src="item.attributes.cover" 
          :to="`/works/${item.attributes.slug}`" 
          :title="item.attributes.titre"
          :keywords="item.attributes.keywords.data" />
      </template>
    </section>
    <!-- <Footer :projects="projectsFooter" :footer="footer"></Footer> -->
  </div>  
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollOpacity from '~/compositions/use-scroll-opacity';
import useLogoObserver from '~/compositions/use-logo-observer';
import gsap from 'gsap';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);
await fetchDatas(S_DATA_PROJECTS);

// const datasAccueil = storeDatas.accueil.data.attributes;
const datasProjets = storeDatas.projects.data;
// console.log('datasProjets', datasProjets);

const root = ref(null);
const { initScrollOpacity, clearScrollOpacity } = useScrollOpacity();
const { initLogoObserver, clearLogoObserver } = useLogoObserver();

let ioLogo = null;

onMounted(() => {
  gsap.set('#header-logo', { translateX: -20, opacity: 0 })
  gsap.set('#index-logo', { translateX: -20, opacity: 0 })
  gsap.to('#index-logo', { delay: 1, translateX: 0, opacity: 1 })
  
  initLogoObserver()

  nextTick(() => {
    initScrollOpacity(root.value)
  })
})

onUnmounted(() => {
  clearScrollOpacity()
  clearLogoObserver()
})

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