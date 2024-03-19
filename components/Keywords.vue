<template>
  <div class="keywords">
    <div class="keywords__menu">
      <div 
        class="keywords__menu__button"
        v-on:click="onClickMenuButton"
        data-mouse-cursor="hover"
      >
        <div class="keywords__menu__button__label">
          <div class="front">Filtres</div>
          <div class="back">Filtres</div>
        </div>
        <div class="keywords__menu__button__arrow">
          <svg width="16px" height="29px" viewBox="0 0 16 29">
            <path class="arrow__back" fill-rule="evenodd" fill="rgb(0, 0, 0)"
            d="m 15.064334,27.121334 -0.943,0.931 -13.0630007,-12.899 0.6050001,-0.598 -0.6050001,-0.598 13.0630007,-12.8990007 0.943,0.9310001 L 2.3383334,14.555334 Z"/>
            <path fill-rule="evenodd" fill="rgb(255, 255, 255)"
            d="m 15.006,26.004666 -0.943,0.931 L 1,14.036666 1.6050001,13.438666 1,12.840666 14.063,-0.05833334 15.006,0.87266663 2.28,13.438666 Z"/>
          </svg>
          <svg class="keywords__menu__button__arrow__right" width="16px" height="29px" viewBox="0 0 16 29">
            <path class="arrow__back" fill-rule="evenodd" fill="rgb(0, 0, 0)"
            d="m 1.5291667,27.121334 0.943,0.931 13.0630013,-12.899 -0.605,-0.598 0.605,-0.598 L 2.4721667,1.0583333 1.5291667,1.9893334 14.255168,14.555334 Z"/>
            <path fill-rule="evenodd" fill="rgb(255, 255, 255)"
            d="m 1.5875007,26.004666 0.943,0.931 13.0630003,-12.899 -0.605,-0.598 0.605,-0.598 L 2.5305007,-0.05833334 1.5875007,0.87266663 14.313501,13.438666 Z"/>
          </svg>
        </div>
      </div>
      <div class="keywords__menu__content">
        <template v-for="(item, index) in datasKeywords">
          <button 
            v-if="item.attributes.projets.data.length > 0" 
            class="menu-item"
            :class="{ disable: isSelected(item)}"
            v-on:click="onClickItem(item)"
          >
            {{ item.attributes.key }}
          </button>
        </template>
      </div>
      <div class="keywords__menu__selected">
        <template v-for="(item, index) in datasKeywordsSelected">
          <button 
            v-if="item.attributes.projets.data.length > 0" 
            class="menu-item selected" 
            v-on:click="onClickRemoveItem(item)"
          >
            <span class="btn-close"></span>
            <span class="label">{{ item.attributes.key }}</span>
          </button>
        </template>
      </div>
      <div class="keywords__menu__zone" v-on:click="closeMenu"></div>
    </div>
  </div>
</template>

<script setup>
import gsap from 'gsap'
import { useDatasStore, S_DATA_PROJECTS, S_DATA_KEYWORDS } from '~/stores/datas'

const router = useRouter();

const storeDatas = useDatasStore()
const { fetchDatas } = storeDatas
await fetchDatas(S_DATA_PROJECTS);
await fetchDatas(S_DATA_KEYWORDS);

const props = defineProps({
  show: Boolean
})

const datasKeywords = storeDatas.keywords.data;
let datasKeywordsSelected = ref([]);

let isMenuOpened = false
let isDesktop = computed(() => window.innerWidth >= 1200)

const isSelected = (oItem) => {
  return datasKeywordsSelected.value.includes(oItem)
}

const onClickItem = (oItem) => {
  console.log('> onClickItem', oItem.id, oItem.attributes.projets.data);

  if (router.currentRoute.value.name !== 'works') {
    router.push({ name: 'works' })
  }

  datasKeywordsSelected.value.push(oItem);

  storeDatas.filterProjects(datasKeywordsSelected.value);
  closeMenu()
}

const onClickRemoveItem = (oItem) => {
  // console.log('> onClickRemoveItem', oItem.id, oItem.attributes.projets.data);

  datasKeywordsSelected.value.forEach((item, index) => {
    if (oItem.id === item.id) {
      datasKeywordsSelected.value.splice(index, 1);
    }
  })

  storeDatas.filterProjects(datasKeywordsSelected.value);
}

watch(() => props.show, (newValue, oldValue) => {
  if (newValue === true) {
    openMenu()
  } else {
    closeMenu()
  }
})

const onClickMenuButton = () => {
  if (isMenuOpened) {
    closeMenu()
  } else {
    openMenu()
  }
}

const hideButton = () => {
  if (props.show === false) {
    gsap.to('.keywords__menu__button', {
      duration: 0.2,
      autoAlpha: 0
    })
  }
}

const showButton = () => {
  if (props.show === true) {
    gsap.to('.keywords__menu__button', {
      duration: 0.2,
      autoAlpha: 1
    })
  }
}

const closeMenu = () => {
  isMenuOpened = false
  gsap.to('.keywords__menu__zone', {
    delay: 0.4,
    duration: 0.5,
    autoAlpha: 0
  })
  gsap.to('.keywords__menu__content .menu-item', {
    duration: 0.4,
    stagger: {
      each: 0.1,
      from: 'end'
    },
    autoAlpha: 0,
    onComplete: () => {
      hideButton()
    }
  })
  gsap.to('.keywords__menu__content', {
    delay: 0.5,
    duration: 0.5,
    height: 0,
    top: 60,
    ease: 'power4.out'
  })
  gsap.to('.keywords__menu__button__arrow__right', {
    delay: 0.6,
    duration: 0.5,
    autoAlpha: 0,
    // transform: 'translateX(-100%) rotate(180deg) scale(0)',
    transform: 'scale(0)',
  })
}

const openMenu = () => {
  isMenuOpened = true
  showButton()
  gsap.to('.keywords__menu__zone', {
    duration: 0.2,
    autoAlpha: 1
  })
  gsap.fromTo('.keywords__menu__content .menu-item', {
    autoAlpha: 0,
  }, {
    delay: 0.3,
    duration: 0.5,
    stagger: 0.1,
    autoAlpha: 1
  })
  gsap.to('.keywords__menu__content', {
    duration: 0.5,
    height: 'auto',
    ease: 'power4.out',
    top: 60
  })
  gsap.to('.keywords__menu__button__arrow__right', {
    duration: 0.5,
    autoAlpha: 1,
    // transform: 'translateX(-100%) rotate(180deg) scale(1)',
    transform: 'scale(1)',
  })
}

onMounted(() => {
  gsap.set('.keywords__menu', { visibility: 'visible' })
  gsap.set('.keywords__menu__content', { height: 0 })
  gsap.set('.keywords__menu__zone', { autoAlpha: 0 })
  gsap.set('.keywords__menu__button__arrow__right', { autoAlpha: 0, transform: 'scale(0)' })

  if (isDesktop === true)
    openMenu()
})
</script>

<style lang="scss" scoped>
.menu-item {
  pointer-events: all;
  cursor: pointer;
  width: 100px;
  font-size: 12px;
  font-weight: 500;
  border: 0;
  padding: 3px 2px;
  color: rgb(0, 0, 0);
  background-color: rgb(255, 255, 255);
  transition: background-color 0.8s ease-in-out, color 0.8s ease-in-out;

  &:hover {
    background-color: rgba(19, 19, 19, 0.5);
    color: rgb(250, 250, 250);
    transition: background-color 0.0s ease-in-out, color 0.0s ease-in-out;
  }

  @include media-breakpoint-up(xl) {
    font-size: 13px;
    padding: 4px 2px;
  }

  &.selected {
    // text-decoration: underline;
    position: relative;
    font-size: 10px;
    display: flex;
    // justify-content: space-around;
    align-items: center;
    width: auto;
    padding-left: 5px;
    padding-right: 10px;
    .label {
      font-weight: 800;
      font-size: 10px;
    }
    .btn-close {
      width: 10px;
      height: 10px;
      background-image: url('~/assets/svg/btn-close-black.svg');
      background-size: contain;
      background-repeat: no-repeat;
      margin-right: 6px;
      font-weight: 500;
    }

    @include media-breakpoint-up(xl) {
      width: 100px;

      .label {
        font-weight: 500;
        font-size: 12px;
      }
    }
  }

  &.disable {
    pointer-events: none;
    background-color: #555;
  }
}

.keywords {  
  position: fixed;
  top: 40px;
  right: 0;
  width: 100%;
  z-index: $z-header;

  @include media-breakpoint-up(xl) {
    top: 66px;
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 0;
    width: 100%;
    background-color: rgba(0, 0, 0, 1);
    transition: height 0.2s ease-in-out;

    .header-minimize & {
      height: 30px;
      transition: height 0.2s ease-in-out;
    }
  }

  &__menu {

    visibility: hidden;

    &__button {
      position: absolute;
      z-index: $z-menu-button;
      display: flex;    
      align-items: center;
      flex-direction: column;
      padding: 10px;
      transform-origin: right bottom;
      cursor: pointer;
      right: 0;

      @include media-breakpoint-up(xl) {
        right: 90px;
      }

      &__label {
        display: flex;
        font-size: 10px;
        font-weight: 500;
        color: #fff;
        pointer-events: none;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        position: relative;
        
        @include media-breakpoint-up(xl) {
          font-size: 11px;
        }
      }

      &__arrow {
        display: flex;
        margin-right: 10px;
        position: relative;
        transform: rotate(-90deg);
        margin-left: 10px;
        margin-top: 5px;

        svg {
          width: 4.666667px;
          height: 9px;
        }

        &__right {
          position: absolute;
          left: -5px;
          transform-origin: right center;
        }
      }
    }

    &__content {
      z-index: $z-menu;
      display: flex;
      flex-direction: column;
      justify-content: right;
      width: 100px;
      background-color: rgba(19, 19, 19, 1.0);
      overflow: hidden;
      position: absolute;
      right: 0;

      @include media-breakpoint-up(xl) {
        right: 69px;
      }
    }

    &__selected {
      z-index: 1600;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-end;
      width: auto;
      background-color: #000000;
      overflow: hidden;
      position: absolute;
      right: 0;
      top: 40px;

      @include media-breakpoint-up(xl) {
        right: 69px;
      }
    }

    &__zone {
      background-color: rgba(0, 0, 0, 0.65);
      position: fixed;
      width: 100%;
      height: 100vh;
      z-index: $z-menu-zone;
      top: 0;

      @include media-breakpoint-up(lg) {
        display: none;
      }
    }
  }
}

.front {
  position: relative;
  color: #ffffff;
  z-index: 1;
}

.back {
  position: absolute;
  color: #242525;
  top: 1px;
  left: 1px;
  // margin: 7px 10px 10px;
}

</style>