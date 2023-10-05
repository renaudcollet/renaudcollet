<template>
  <div ref="root">
    <ClientOnly>
      <ShaderPass 
        :params="firstPassProps"
        @render="onFirstPassRender"
        @ready="onFirstPassReady"
      />
    </ClientOnly>
    <div class="container">
      <!-- <div class="container__header-minimize" data-header-scroll-minimize></div> -->
      <h1 
        class="page__title scroll-reveal"
        data-scroll-reveal-opacity-y
        data-scroll-reveal-delay="0.0"
        data-scroll-reveal-duration="0.5"
      >
        All my works
      </h1>
      <section class="projects-work">
        <template v-for="(item, index) in storeDatas.projectsFiltered">
          <ProjectItem 
            class="projects-home__item" 
            :id="index" 
            :to="`/works/${item.attributes.slug}`"
            :datas="item"
            :onRender="onRender"
          />
        </template>
      </section>
      <div class="space"></div>
    </div>
    <FooterSimple />
  </div>
</template>
  
<script setup>
import { ShaderPass } from 'vue-curtains';
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_PROJECTS } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
// import useLogoObserver from '~/compositions/use-logo-observer';
// import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import useCurtainsShader from '~/compositions/use-curtains-shader';
import gsap from 'gsap';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);
await fetchDatas(S_DATA_PROJECTS);

const props = defineProps({
  scrollVelocity: {
    type: Number
  },
})

const root = ref(null);
const { initScrollReveal, clearScrollReveal } = useScrollReveal();
const { 
  firstPassProps, 
  onFirstPassReady, 
  onFirstPassRender, 
  onRender, 
  updateScrollVelocity
} = useCurtainsShader();

const scrollVelocity = toRef(props, 'scrollVelocity');
watch(scrollVelocity, (newVal, oldVal) => {
  // console.log('watch scrollVelocity', newVal, oldVal);
  updateScrollVelocity(newVal)
})

watch(() => storeDatas.projectsFiltered, (newVal, oldVal) => {
  // console.log('watch projectsFiltered', newVal, oldVal);
  nextTick(() => {
    initScrollReveal(root.value)
  })
})

onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })

  nextTick(() => {
    initScrollReveal(root.value)
  })
})

onUnmounted(() => {
  clearScrollReveal()
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
  margin-top: 100px;
  margin-bottom: 100px;
  text-align: center;
  font-size: 28px;
  font-weight: 800;

  @include media-breakpoint-up(md) {
    // margin-top: 43vh;
    // margin-bottom: 36vw;
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