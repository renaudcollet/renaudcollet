<template>
  <div class="page">
    <section>
      <div class="block agence">
        <div class="header-minimize" data-header-scroll-minimize></div>
        <h1 class="title-agence scroll-opacity" data-scroll-index="0">L'agence<sub class="big-underscore"> —</sub></h1>
        <p class="scroll-opacity" data-scroll-index="1">
          <span v-html="findAndReplaceGroupie(agence[0].value)"></span>
        </p>
      </div>
      <div class="title-metiers-center"><h1 class="title-metiers scroll-opacity" data-scroll-index="2">Nos<br/>métiers<sub class="big-underscore"> —</sub></h1></div>
      <div class="block publicitee">
        <h2 class="scroll-opacity" data-scroll-index="3" v-html="metiers[1].value"></h2>
        <p class=" scroll-opacity" data-scroll-index="4" v-html="metiers[2].value"></p>
      </div>

      <div class="row">
        <div class="block reseaux">
          <h2 class=" scroll-opacity" data-scroll-index="5" v-html="metiers[4].value"></h2>
          <p class=" scroll-opacity" data-scroll-index="6" v-html="metiers[5].value"></p>
        </div>
  
        <div class="block corporate">
          <h2 class=" scroll-opacity" data-scroll-index="7" v-html="metiers[7].value"></h2>
          <p class=" scroll-opacity" data-scroll-index="8" v-html="metiers[8].value"></p>
        </div>
      </div>

      <div class="block creative">
        <h2 class=" scroll-opacity" data-scroll-index="9" v-html="metiers[10].value"></h2>
        <p class=" scroll-opacity" data-scroll-index="10" v-html="metiers[11].value"></p>
      </div>
    </section>
    <Footer :projects="projects" :footer="footer"></Footer>
  </div>  
</template>

<script>
import scrollOpacity from '~~/mixins/scroll-opacity';
import utilsDevice from '~~/mixins/utils-device.js';
import { useDatasStore } from '~/stores/datas';
import gsap from 'gsap';
import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';

export default {

  setup() {
    const storeDatas = useDatasStore()

    // I don't know why, I can't use useHead() after receiving the data from the store in the default layout
    useHead({
      // titleTemplate: '%s - Accueil',
      titleTemplate: '%s',
      meta: [
        { name: "description", content: datasSEO.blocks[0].value },
        { property: 'og:description', content: datasSEO.blocks[0].value },
        { property: 'og:image', content: datasSEO.blocks[1].value },
      ],
    })

    return {
      agence: storeDatas.agence.sections[0].blocks,
      metiers: storeDatas.agence.sections[1].blocks,
      projects: storeDatas.projects,
      footer: storeDatas.footer
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
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 60px;

  @include media-breakpoint-up(lg) {
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
      width: 42.6vw;

      &.agence {
        width: 600px;
        margin-right: 100px;
        margin-left: auto;
        align-self: flex-end;
        margin-bottom: 0;

        p {
          margin-left: 45px;
        }
      }

      &.publicitee { // Keep this name with 2 e, otherwise addblock or something from the browser is injecting a display: none !important; on this element
        margin-left: 19vw;
      }

      // &.reseaux {
      //   // margin-left: 21.838235vw;
      // }

      &.corporate {
        margin-top: -55px;
        width: 37vw;
        margin-left: 6vw;
      }

      &.creative {
        margin-left: 45vw;
        margin-top: -40px;
      }
    }

    @include media-breakpoint-up(xl) {
      margin-bottom: 105px;
      width: 39.6vw;

      &.agence {
        width: 600px;
        margin-right: auto;
        margin-left: 40vw;
        align-self: flex-end;
        margin-bottom: 0;

        p {
          margin-left: 45px;
        }
      }

      &.publicitee {
        margin-left: 29.191176vw;
      }

      &.reseaux {
        width: 29.6vw;
      }

      &.corporate {
        margin-top: -25px;
        width: 34vw;
        margin-left: 5vw;
      }
 
      &.creative {
        margin-left: 45vw;
        margin-top: -40px;
      }
    }
  }

  .title-metiers-center {
    width: 100%;
  }

  .row {
    margin-bottom: 50px;
  }

  @include media-breakpoint-up(lg) {
    .title-metiers-center {
      display: flex;
      justify-content: center;
      width: 100%;
    }
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
    .title-metiers-center {
      display: flex;
      justify-content: center;
      width: 100%;
    }
    .row {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      width: 100%;
      margin-bottom: 0;
    }
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 23px;
    margin-left: 30px;
    width: calc(100% - 60px);

    &.title-agence {
      margin-top: 45vh;
    }

    &.title-metiers {
      margin-top: 0;
      margin-left: 30px;
      margin-bottom: 40px;
    }

    @include media-breakpoint-up(lg) {
      font-size: 72px;
      line-height: 0.9;

      &.title-agence {
        margin-top: 10vh;
        margin-left: 0;
      }

      &.title-metiers {
        width: auto;
        margin-top: 115px;
        margin-bottom: 115px;
      }
    }

    @include media-breakpoint-up(xl) {
      font-size: 72px;

      &.title-agence {
        margin-top: 170px;
        margin-bottom: 50px;
      }

      &.title-metiers {
        width: auto;
        margin-top: 115px;
        margin-bottom: 115px;
      }
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

    .font-groupie {
      font-size: 15px;

      @include media-breakpoint-up(lg) {
        font-size: 26px;
      }

      @include media-breakpoint-up(xl) {
        font-size: 29px;
      }
    }
  }
}
</style>