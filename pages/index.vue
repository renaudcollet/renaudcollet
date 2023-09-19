<template>
  <div ref="root">
    <div class="header">
      <div id="index-logo" class="logo" data-header-scroll-minimize alt="">
        <Logo />
      </div>
    </div>
    <section class="projects-home">
      <template v-for="(item, index) in storeDatas.projectsFiltered">
        <ProjectItem 
          class="projects-home__item" 
          :id="index"
          :datas="item"
          :to="`/works/${item.attributes.slug}`"
        />
      </template>
    </section>
    <!-- <Footer :projects="projectsFooter" :footer="footer"></Footer> -->
  </div>  
</template>

<script setup>
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollOpacity from '~/compositions/use-scroll-opacity';
import useLogoObserver from '~/compositions/use-logo-observer';
import gsap from 'gsap';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);
await fetchDatas(S_DATA_PROJECTS);

const root = ref(null);
const { initScrollOpacity, clearScrollOpacity } = useScrollOpacity();
const { initLogoObserver, clearLogoObserver } = useLogoObserver();

watch(() => storeDatas.projectsFiltered, (newVal, oldVal) => {
  // console.log('watch projectsFiltered', newVal, oldVal);
  nextTick(() => {
    initScrollOpacity(root.value)
  })
})

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
    margin-bottom: 0;
    width: 170px;
    opacity: 0;
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
  z-index: $z-projects;
}
</style>