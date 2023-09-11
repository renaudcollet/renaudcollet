<template>
  <div ref="root" class="page">
    <section id="about">
      <div class="block agence">
        <div class="header-minimize" data-header-scroll-minimize></div>
        <h1 class="title-agence scroll-opacity" data-scroll-index="0">{{ datasAbout.attributes.titre }}<sub class="big-underscore"> —</sub></h1>
        <p class="scroll-opacity" data-scroll-index="1">
          <span v-html="datasAbout.attributes.description"></span>
        </p>
      </div>
      <!-- <div class="title-metiers-center"><h1 class="title-metiers scroll-opacity" data-scroll-index="2">Nos<br/>métiers<sub class="big-underscore"> —</sub></h1></div>
      <div class="block publicitee">
        <h2 class="scroll-opacity" data-scroll-index="3" v-html="metiers[1].value"></h2>
        <p class=" scroll-opacity" data-scroll-index="4" v-html="metiers[2].value"></p>
      </div>

      <div class="row">
        <div class="block reseaux">
          <h2 class=" scroll-opacity" data-scroll-index="5" v-html="metiers[4].value"></h2>
          <p class=" scroll-opacity" data-scroll-index="6" v-html="metiers[5].value"></p>
        </div>
      </div>

      <div class="block creative">
        <h2 class=" scroll-opacity" data-scroll-index="9" v-html="metiers[10].value"></h2>
        <p class=" scroll-opacity" data-scroll-index="10" v-html="metiers[11].value"></p>
      </div> -->
    </section>
    <!-- <section id="contact">
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
    </section> -->
    <!-- <Footer :projects="projects" :footer="footer"></Footer> -->
  </div>  
</template>

<script setup>
// import scrollOpacity from '~~/mixins/scroll-opacity';
// import utilsDevice from '~~/mixins/utils-device.js';
// import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import { useDatasStore, S_DATA_ACCUEIL, S_DATA_ABOUT } from '~/stores/datas';
import useScrollOpacity from '~/compositions/use-scroll-opacity';
import gsap from 'gsap';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
// await fetchDatas(S_DATA_ACCUEIL);
await fetchDatas(S_DATA_ABOUT);

const datasAbout = storeDatas.about.data;


// I don't know why, I can't use useHead() after receiving the data from the store in the default layout
// useHead({
//   // titleTemplate: '%s - Accueil',
//   titleTemplate: '%s',
//   meta: [
//     { name: "description", content: datasSEO.blocks[0].value },
//     { property: 'og:description', content: datasSEO.blocks[0].value },
//     { property: 'og:image', content: datasSEO.blocks[1].value },
//   ],
// })

const root = ref(null);
const { initScrollOpacity, clearScrollOpacity } = useScrollOpacity();

onMounted(() => {
  gsap.set('#header-logo', { translateX: -20, opacity: 0 })
  gsap.set('#index-logo', { translateX: -20, opacity: 0 })
  gsap.to('#index-logo', { delay: 1, translateX: 0, opacity: 1 })

  nextTick(() => {
    initScrollOpacity(root.value)
    // initScrollHeaderMinimize(root.value)
  })
})

onUnmounted(() => {
  clearScrollOpacity()
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

#about {
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