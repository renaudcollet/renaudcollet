<template>
  <div class="page">
    <!-- <ShaderPass
      v-if="supportsCurtains"
      :params="firstPassProps"
      @render="onFirstPassRender"
      @ready="onFirstPassReady"
      ref="firstPass"
    /> -->
    <section>
      <div class="header-minimize" data-header-scroll-minimize></div>
      <h1 class="scroll-opacity" data-scroll-index="0">Contact<sub class="big-underscore"> —</sub></h1>
      <p>
        <span class="scroll-opacity" data-scroll-index="1">{{contact[0].value}}</span><br />
        <a :href="`tel:${contact[1].value}`" class="scroll-opacity" data-scroll-index="2">{{contact[1].value}}</a>
      </p>
      <p>
        <span class="scroll-opacity" data-scroll-index="3">{{contact[3].value}}</span><br />
        <a :href="`tel:${contact[4].value}`" class="scroll-opacity" data-scroll-index="4">{{contact[4].value}}</a><br />
        <a :href="`mailto:${contact[5].value}`" class="scroll-opacity" data-scroll-index="5">{{contact[5].value}}</a>
      </p>
      <p>
        <span class="scroll-opacity" data-scroll-index="6">{{contact[7].value}}</span><br />
        <a :href="`mailto:${contact[8].value}`" class="scroll-opacity" data-scroll-index="7">{{contact[8].value}}</a>
      </p>
    </section>
    <Footer :projects="projects" :footer="footer"></Footer>
  </div>  
</template>

<script>
import { ShaderPass } from 'vue-curtains';
import curtainsShader from '~/mixins/curtains-shader';
import scrollOpacity from '~~/mixins/scroll-opacity';
import utilsDevice from '~~/mixins/utils-device.js';
// import { storeToRefs } from 'pinia';
import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import { useDatasStore } from '~/stores/datas';
import gsap from 'gsap';

export default {
  components: {
    ShaderPass,
  },

  setup() {
    const storeDatas = useDatasStore()
    const oSeo = storeDatas.seo.sections[0]

    // I don't know why, I can't use useHead() after receiving the data from the store in the default layout
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
      contact: storeDatas.contact.sections[0].blocks,
      projects: storeDatas.projects,
      footer: storeDatas.footer,
      seo: oSeo
    }
  },

  mounted() {
    gsap.killTweensOf('#header-logo')
    gsap.to('#header-logo', { autoAlpha: 1 })
  },

  mixins: [
    curtainsShader,
    scrollOpacity,
    utilsDevice,
    scrollHeaderMinimize
  ],
};
</script>

<style lang="scss" scoped>
.header-minimize {
  position: absolute;
  top: 30vh;
  width: 10px;
  height: 10px;
}
section {
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