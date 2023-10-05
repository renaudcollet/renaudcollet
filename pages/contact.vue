<template>
  <div ref="root" class="page">
    <section id="contact">
      <div class="header-minimize" data-header-scroll-minimize></div>
      <h1 
        class="scroll-reveal"
        data-scroll-reveal-opacity-y
        data-scroll-reveal-delay="0.2"
        data-scroll-reveal-duration="0.5"
      >
        {{ datasContact.attributes.titre }}
      </h1>
      <p>
        <span 
          class="scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.2"
          data-scroll-reveal-duration="0.5"
        >
          {{ datasContact.attributes.description }}
        </span>
        <br />
        <a 
          :href="`tel:${datasContact.attributes.tel}`"
          class="scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.2"
          data-scroll-reveal-duration="0.5"
        >
          {{ datasContact.attributes.tel }}
        </a>
        <br />
        <a
          :href="`mailto:${datasContact.attributes.email}`"
          class="scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.2"
          data-scroll-reveal-duration="0.5"
        >
          {{ datasContact.attributes.email }}
        </a>
      </p>
    </section>
    <FooterSimple />
  </div>  
</template>

<script setup>
// import utilsDevice from '~~/mixins/utils-device.js';
// import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import { useDatasStore, S_DATA_CONTACT } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import gsap from 'gsap';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_CONTACT);

const datasContact = storeDatas.contact.data;

const root = ref(null);
const { initScrollReveal, clearScrollReveal } = useScrollReveal();

onMounted(() => {
  gsap.killTweensOf('#header-logo')
  gsap.to('#header-logo', { autoAlpha: 1 })

  nextTick(() => {
    initScrollReveal(root.value)
    // initScrollHeaderMinimize(root.value)
  })
})

onUnmounted(() => {
  clearScrollReveal()
  // clearLogoObserver()
})
</script>

<style lang="scss" scoped>
.header-minimize {
  position: absolute;
  top: 30vh;
  width: 10px;
  height: 10px;
}

#contact {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 60px;

  @include media-breakpoint-up(md) {
    width: auto;
    margin-right: auto;
    margin-left: auto;
    height: 100vh;
    align-items: center;
  }

  @include media-breakpoint-up(lg) {
    width: auto;
    margin-right: auto;
    margin-left: 40%;
    align-items: flex-start;
  }

  @include media-breakpoint-up(xl) {
    width: auto;
    margin-right: auto;
    margin-left: 45%;
    height: 100vh;
  }

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 41px;
    margin-top: 45vh;

    @include media-breakpoint-up(md) {
      font-size: 72px;
      margin-top: 10vh;
    }

    @include media-breakpoint-up(xl) {
      font-size: 72px;
      margin-top: 10vh;
    }
  }

  p {
    text-align: center;
    font-size: 14px;
    font-weight: 300;
    margin-bottom: 26px;
    user-select: all;

    @include media-breakpoint-up(md) {
      text-align: left;
      font-size: 22px;
      width: auto;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.15;
      text-align: center;
    }

    @include media-breakpoint-up(lg) {
      width: auto;
      text-align: left;
      margin-left: 0;
      margin-right: auto;
    }

    @include media-breakpoint-up(xl) {
      line-height: 1.15;
    }
  }

  span {
    display: inline-flex;
  }

  a {
    display: inline-flex;
    color: #ffffff;
    text-decoration: none;
  }
}
</style>