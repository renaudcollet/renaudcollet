<template>
  <div>
    <ClientOnly>
      <ShaderPass
        v-if="supportsCurtains"
        :params="firstPassProps"
        @render="onFirstPassRender"
        @ready="onFirstPassReady"
        ref="firstPass"
      />
    </ClientOnly>
    <div class="container">
      <div class="container__header-minimize" data-header-scroll-minimize></div>
      <h1 class="page__title scroll-opacity" data-scroll-index="0">Tous<br />nos projets&nbsp;<sub class="big-underscore">&nbsp;—</sub></h1>
      <section class="projects-work">
        <template v-for="(item, index) in projects">
          <ProjectItem class="projects-work__item" :index="index" :src="item.sections[0].blocks[3].value" :to="`/work/${item.slug}`" :title="item.sections[0].blocks[0].value" :subtitle="['Brand Content', 'Réseaux Sociaux']" :onRender="onRender"/>
        </template>
      </section>
      <div class="space"></div>
    </div>
    <Footer :footer="footer"></Footer>
  </div>
</template>
  
<script>
  import { ShaderPass } from 'vue-curtains';
  import curtainsShader from "~/mixins/curtains-shader";
  import scrollOpacity from '~~/mixins/scroll-opacity';
  import utilsDevice from '~~/mixins/utils-device.js';
  import { useDatasStore } from '~/stores/datas';
  import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
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
          { property: 'og:value', content: oSeo.blocks[1].value },
        ],
      })

      return {
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