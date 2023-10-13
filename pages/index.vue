<template>
  <div ref="root">
    <ClientOnly>
      <ShaderPass 
        :params="firstPassProps"
        @render="onFirstPassRender"
        @ready="onFirstPassReady"
      />
    </ClientOnly>
    <div class="cover">
      <Cover3D />
      <div id="index-logo" class="logo" data-header-scroll-minimize alt="">
        <Logo />
      </div>
      <div>
        Freelance Web Developer
      </div>
    </div>
    <section class="projects-home">
      <template v-for="(item, index) in storeDatas.projectsHomepage" :key="index">
        <ProjectItem 
          class="projects-home__item" 
          :id="index"
          :datas="item"
          :to="`/works/${item.attributes.slug}`"
          :onRender="onRender"
        />
      </template>
    </section>
    <FooterSimple />
  </div>  
</template>

<script setup>
import Cover3D from '~/components/webgl/Cover3D.vue';
import { ShaderPass } from 'vue-curtains';
import { useDatasStore, S_DATA_ACCUEIL } from '~/stores/datas';
import useScrollReveal from '~/compositions/use-scroll-reveal';
import useLogoObserver from '~/compositions/use-logo-observer';
import useCurtainsShader from '~/compositions/use-curtains-shader';
import gsap from 'gsap';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_ACCUEIL);

const props = defineProps({
  scrollVelocity: {
    type: Number
  },
})

const root = ref(null);
const { initLogoObserver, clearLogoObserver } = useLogoObserver();
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

onMounted(() => {
  gsap.set('#cover-logo', { translateX: -20, opacity: 0 })
  gsap.set('#index-logo', { translateX: -20, opacity: 0 })
  gsap.to('#index-logo', { delay: 1, translateX: 0, opacity: 1 })
  
  initLogoObserver()

  nextTick(() => {
    initScrollReveal(root.value)
  })
})

onUnmounted(() => {
  clearLogoObserver()
  clearScrollReveal()
})

</script>

<style lang="scss" scoped>
.props {
  position: fixed;
  background-color: #000;
  color: #fff;
  top: 0;
  width: 100px;
  height: 50px;
}
.cover {
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  pointer-events: none;
  position: relative;
  
  .logo{
    margin-bottom: 0;
    width: 170px;
    opacity: 0;
  }
}

@media only screen and (min-width: 768px) {
  .cover {
    justify-content: left;
    margin-left: 20vw;
    width: calc(100% - 20vw);
    
    .logo{
      margin-top: 0px;
      width: 250px;
      position: relative;
      bottom: auto;
    }
  }
}

.projects-home {
  display: flex;
  flex-direction: column;
  position: relative;
  user-select: none;
  z-index: $z-projects;
  margin-top: 50px;
}
</style>