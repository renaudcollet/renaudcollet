<template>
  <div class="page">
    <section>
      <div class="block">
        <div class="header-minimize" data-header-scroll-minimize></div>
        <h1 class="title-agence" data-scroll-index="0">Mentions légales<sub class="big-underscore">&nbsp;—</sub></h1>
        <p>
          <span v-html="findAndReplaceGroupie(legals.value)"></span>
        </p>
      </div>
    </section>
    <Footer :projects="projects" :footer="footer"></Footer>
  </div>  
</template>

<script>
import gsap from 'gsap';
import utilsDevice from '~~/mixins/utils-device.js';
import { useDatasStore } from '~/stores/datas';
import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';

export default {
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
    })

    return {
      seo: oSeo,
      projects: storeDatas.projects,
      footer: storeDatas.footer,
      legals: storeDatas.legals.sections[0].blocks[0],
    }
  },

  mounted() {
    gsap.killTweensOf('#header-logo')
    gsap.to('#header-logo', { autoAlpha: 1 })
  },

  methods: {
    findAndReplaceGroupie(content) {
      return content.replace(/Groupie/g, '<span class="font-groupie">Groupie</span>');
    },
  },

  mixins: [
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
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 60px;
  padding-top: 30vh;

  @include media-breakpoint-up(lg) {
    padding-top: 160px;
    margin-bottom: 150px;
  }

  @include media-breakpoint-up(xl) {
    margin-bottom: 150px;
  }

  .block {
    width: 100%;
    margin-bottom: 50px;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    @include media-breakpoint-up(lg) {
      margin-bottom: 105px;
      width: 60.6vw;
    }

    @include media-breakpoint-up(xl) {
      margin-bottom: 105px;
      width: 60.6vw;
    }
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 23px;
    margin-left: 30px;
    width: calc(100% - 60px);

    @include media-breakpoint-up(lg) {
      font-size: 72px;
      line-height: 0.9;
    }

    @include media-breakpoint-up(xl) {
      font-size: 72px;
    }
  }

  h2 {
    position: relative;
    font-size: 14px;
    text-decoration: underline;
    line-height: 1.2;
    margin-left: 60px;
    margin-bottom: 20px;

    &::before {
      content: '';
      position: absolute;
      width: 20px;
      height: 2px;
      background-color: #fff;
      top: -13px;
    }

    @include media-breakpoint-up(md) {
      font-size: 16px;
    }

    @include media-breakpoint-up(lg) {
      font-size: 22px;
    }

    @include media-breakpoint-up(xl) {
      font-size: 28px;
    }
  }

  p {
    @include font-main();
    font-weight: 300;
    margin-bottom: 0;
    margin-left: 60px;
    width: calc(100% - 120px);

    @include media-breakpoint-up(lg) {
      font-size: 16px;
    }

    @include media-breakpoint-up(xl) {
      font-size: 16px;
    }

    .font-groupie {
      font-size: 15px;

      @include media-breakpoint-up(lg) {
        font-size: 18px;
      }

      @include media-breakpoint-up(xl) {
        font-size: 18px;
      }
    }
  }
}
</style>