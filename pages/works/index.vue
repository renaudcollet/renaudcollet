<template>
  <div ref="root">
    <div class="container">
      <div class="container__header-minimize" data-header-scroll-minimize></div>
      <h1 class="page__title scroll-opacity" data-scroll-index="0">All<br />my works&nbsp;<sub class="big-underscore">&nbsp;—</sub></h1>
      <section class="projects-work">
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
      <div class="space"></div>
    </div>
    <!-- <Footer :footer="footer"></Footer> -->
  </div>
</template>
  
<script setup>
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollOpacity from '~/compositions/use-scroll-opacity';
import useLogoObserver from '~/compositions/use-logo-observer';
// import utilsDevice from '~~/mixins/utils-device.js';
// import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import gsap from 'gsap';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);
await fetchDatas(S_DATA_PROJECTS);

const datasProjets = storeDatas.projects.data;

const root = ref(null);
const { initScrollOpacity, clearScrollOpacity } = useScrollOpacity();

onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })

  nextTick(() => {
    initScrollOpacity(root.value)
  })
})

onUnmounted(() => {
  clearScrollOpacity()
})

</script>
  
<style lang="scss" scoped>
.projects-work {
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
  align-items: center;
  z-index: $z-projects;
}

.space {
  height: 10vh;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  &__header-minimize {
    position: absolute;
    top: 30vh;
    width: 10px;
    height: 10px;
  }
}

.page__title {
  margin-top: 45vh;
  margin-bottom: 130px;
  text-align: center;
  font-size: 28px;
  font-weight: 900;

  @include media-breakpoint-up(md) {
    margin-top: 43vh;
    margin-bottom: 36vw;
    font-size: 7.777778vw;
  }

  @include media-breakpoint-up(lg) {
    margin-top: 0;
    padding-top: 160px;
    margin-bottom: 200px;
    font-size: 62px;
    margin-left: 220px;
    width: 580px;
    text-align: left;
  }

  @include media-breakpoint-up(xl) {
    margin-top: 0;
    padding-top: 170px;
    margin-bottom: 200px;
    font-size: 72px;
    margin-left: 290px;
    width: 650px;
  }
}
</style>