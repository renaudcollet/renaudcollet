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
// import utilsDevice from '~~/mixins/utils-device.js';
// import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import { useDatasStore, S_DATA_ABOUT } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import gsap from 'gsap';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ABOUT);

const datasAbout = storeDatas.about.data;
console.log('datasAbout', datasAbout);

const root = ref(null);
const { initScrollReveal, clearScrollReveal } = useScrollReveal();

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

    @include media-breakpoint-up(lg) {
      width: 60%;
    }

    @include media-breakpoint-up(xl) {
      width: 700px;
    }

    .description {
      font-size: 12px;

      @include media-breakpoint-up(md) {
        font-size: 18px;
      }

      @include media-breakpoint-up(lg) {
        font-size: 24px;
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

  
  .page__title {
    margin-top: 100px;
    margin-bottom: 100px;
    text-align: center;
    font-size: $font-size-big-title-sm;
    font-weight: 800;

    @include media-breakpoint-up(md) {
      font-size: $font-size-big-title-md;
    }

    @include media-breakpoint-up(lg) {
      margin-top: 0;
      padding-top: 160px;
      margin-bottom: 200px;
      font-size: $font-size-big-title-lg;
      width: 580px;
    }

    @include media-breakpoint-up(xl) {
      margin-top: 0;
      padding-top: 170px;
      margin-bottom: 200px;
      font-size: $font-size-big-title-xl;
      width: 650px;
    }
  }
}
</style>