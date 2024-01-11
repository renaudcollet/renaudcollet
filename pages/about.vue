<template>
  <div ref="root" class="page">
    <section id="about">
      <div class="block">
        <div class="header-minimize" data-header-scroll-minimize></div>
        <h1 
          class="page__title scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.0"
          data-scroll-reveal-duration="0.5"
        >
          {{ datasAbout.attributes.titre }}
        </h1>
        <div
          class="description scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.2"
          data-scroll-reveal-duration="0.5"
          v-html="datasAbout.attributes.description"
        >
        </div>
      </div>
    </section>
    <FooterSimple />
  </div>  
</template>

<script setup>
import { useDatasStore, S_DATA_ABOUT } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import gsap from 'gsap';
import { defaultTransition } from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ABOUT);

const datasAbout = storeDatas.about.data;

const root = ref(null);
const { initScrollReveal, clearScrollReveal } = useScrollReveal();

/**
 *  page transition
 * https://stackblitz.com/edit/nuxt-starter-bthjlg?file=pages%2Flayers.vue
 * */
definePageMeta({
  pageTransition: defaultTransition,
});

const storeDatasCurtains = useDatasCurtainsStore();
const { transitionState } = useTransitionComposable();
watch(() => transitionState.transitionComplete, (newVal, oldVal) => {
  if (newVal) {
    if (storeDatas.previousPage !== null){
      // console.log('emit onLockScroll', false);
      // emit('onLockScroll', false)
    }
    // Remove planes from previous page
    storeDatasCurtains.removePlanes();
  }
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
.header-minimize {
  position: absolute;
  top: 30vh;
  width: 10px;
  height: 10px;
}

#about {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 60px;

  @include media-breakpoint-up(lg) {
    margin-bottom: 150px;
  }

  .block {
    width: 80%;
    margin-right: auto;
    margin-left: auto;
    margin-bottom: 50px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    @include media-breakpoint-up(lg) {
      width: 60%;
    }

    @include media-breakpoint-up(xl) {
      width: 100%;
    }

    .description {
      font-size: $font-size-text-sm;
      line-height: $font-line-height-sm;
      color: #928282;

      @include media-breakpoint-up(md) {
        font-size: $font-size-text-md;
      }

      @include media-breakpoint-up(lg) {
        font-size: $font-size-text-lg;
        width: 700px;
      }

      @include media-breakpoint-up(xl) {
        font-size: $font-size-text-xl;
      }
    }
  }

  .row {
    margin-bottom: 50px;
  }

  @include media-breakpoint-up(lg) {
    .row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      width: 100%;
      margin-bottom: 0;
    }
  }

  @include media-breakpoint-up(xl) {
    .row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      width: 100%;
      margin-bottom: 0;
    }
  }

}
</style>