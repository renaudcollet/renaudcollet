<template>
  <div ref="root" class="page">
    <section id="contact">
      <div class="header-minimize" data-header-scroll-minimize></div>
      <div class="bloc">
        <h1 
          class="scroll-reveal"
          data-scroll-reveal-opacity-y
          data-scroll-reveal-delay="0.0"
          data-scroll-reveal-duration="0.5"
        >
          {{ datasContact.attributes.titre }}
        </h1>
        <div class="content">
          <span 
            class="description scroll-reveal"
            data-scroll-reveal-opacity-y
            data-scroll-reveal-delay="0.2"
            data-scroll-reveal-duration="0.5"
          >
            {{ datasContact.attributes.description }}
          </span>
          <br />
          <div
            class="link-item scroll-reveal"
            data-scroll-reveal-opacity-y
            data-scroll-reveal-delay="0.3"
            data-scroll-reveal-duration="0.5"
          >
            <a 
              :href="`${datasContact.attributes.linkedin}`" 
              target="_blank"
            >
              LinkedIn
            </a>
          </div>
          <div
            @click="clickShowEmail"
            class="link-item pointer-cursor scroll-reveal"
            data-scroll-reveal-opacity-y
            data-scroll-reveal-delay="0.4"
            data-scroll-reveal-duration="0.5"
          >
            <span
              data-mouse-cursor="hover"
            >Email &nbsp;</span>
            <a
              v-if="showEmail"
              :href="`mailto:${datasContact.attributes.email}`"
            >
              {{ datasContact.attributes.email }}
            </a>
          </div>
          <div
            @click="clickShowTel"
            class="link-item pointer-cursor scroll-reveal"
            data-scroll-reveal-opacity-y
            data-scroll-reveal-delay="0.5"
            data-scroll-reveal-duration="0.5"
          >
            <span
              data-mouse-cursor="hover"
            >Phone &nbsp;</span>
            <a 
              v-if="showTel"
              :href="`tel:${datasContact.attributes.tel}`"
            >
              {{ datasContact.attributes.tel }}
            </a>
          </div>
        </div>
      </div>
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
import { defaultTransition } from '../transitions/work-transition';
import { useTransitionComposable } from '../compositions/use-transition';
import { useDatasCurtainsStore } from "~/stores/datasCurtains";

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_CONTACT);

const datasContact = storeDatas.contact.data;

const root = ref(null);
const showTel = ref(false)
const showEmail = ref(false)

const { initScrollReveal, clearScrollReveal } = useScrollReveal();

definePageMeta({
  pageTransition: defaultTransition,
});

const storeDatasCurtains = useDatasCurtainsStore();
const { transitionState } = useTransitionComposable();
watch(() => transitionState.transitionComplete, (newVal, oldVal) => {
  if (newVal) {
    storeDatasCurtains.removePlanes();
  }
})


const clickShowEmail = () => {
  showEmail.value = true
}

const clickShowTel = () => {
  showTel.value = true
}

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

.pointer-cursor {
  cursor: pointer;
}

.description {
  margin-bottom: 20px;

  @include media-breakpoint-up(lg) {
    margin-left: 10px;
  }
}

.link-item {
  margin-bottom: 13px;
  color: $font-color;

  @include media-breakpoint-up(lg) {
    margin-left: 10px;
  }
}

#contact {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // margin-bottom: 60px;
  height: 100vh;
  user-select: none;

  @include media-breakpoint-up(lg) {
    align-items: flex-start;
  }

  h1 {
    font-size: $font-size-big-title-sm;
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;

    @include media-breakpoint-up(md) {
      font-size: $font-size-big-title-md;
      margin-top: 10vh;
      width: 80%;
    }

    @include media-breakpoint-up(lg) {
      font-size: $font-size-big-title-lg;
      // margin-top: 10vh;
      width: 80%;
      text-align: left;
    }

    @include media-breakpoint-up(xl) {
      font-size: $font-size-big-title-xl;
      margin-top: 10vh;
    }
  }

  .content {
    text-align: center;
    font-size: $font-size-text-sm;
    font-weight: 300;
    margin-bottom: 26px;
    user-select: all;
    user-select: none;

    @include media-breakpoint-up(md) {
      text-align: left;
      font-size: $font-size-text-md;
      line-height: 1.15;
      text-align: center;
    }

    @include media-breakpoint-up(lg) {
      text-align: left;
      width: 80%;
      font-size: $font-size-text-lg;
    }

    @include media-breakpoint-up(xl) {
      line-height: 1.15;
      font-size: $font-size-text-xl;
    }
  }

  span {
    display: inline-flex;
  }

  a {
    display: inline-flex;
    text-decoration: none;
    color: $font-color;
  }
}

.bloc {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 296px;
  margin: 0 auto;

  @include media-breakpoint-up(md) {
    width: 100%;
  }

  @include media-breakpoint-up(lg) {
    width: 82vw;
  }

  @include media-breakpoint-up(xl) {
    width: 900px;
  }
}
</style>