<template>
  <div class="keywords">
    <div class="keywords__menu">
      <div class="keywords__menu__button" v-on:click="onClickMenuButton">
        <div class="keywords__menu__button__label">Filtres</div>
        <div class="keywords__menu__button__arrow">
          <svg width="14px" height="27px" viewBox="0 0 14 27">
            <path fill-rule="evenodd" fill="rgb(255, 255, 255)"
            d="M14.006,26.063 L13.063,26.994 L-0.000,14.095 L0.605,13.497 L-0.000,12.899 L13.063,-0.000 L14.006,0.931 L1.280,13.497 L14.006,26.063 Z"/>
          </svg>
          <svg class="keywords__menu__button__arrow__right" width="14px" height="27px" viewBox="0 0 14 27">
            <path fill-rule="evenodd" fill="rgb(255, 255, 255)"
             d="M0,0.9L0.9,0L14,12.9l-0.6,0.6l0.6,0.6L0.9,27L0,26.1l12.7-12.6L0,0.9z"/>
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
            {{ item.attributes.key }}
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

const storeDatas = useDatasStore()
const { fetchDatas } = storeDatas
await fetchDatas(S_DATA_PROJECTS);
await fetchDatas(S_DATA_KEYWORDS);

const datasKeywords = storeDatas.keywords.data;
let datasKeywordsSelected = ref([]);

let isMenuOpened = false
let isDesktop = computed(() => window.innerWidth >= 1200)

const isSelected = (oItem) => {
  return datasKeywordsSelected.value.includes(oItem)
}

const onClickItem = (oItem) => {
  console.log('> onClickItem', oItem.id, oItem.attributes.projets.data);

  datasKeywordsSelected.value.push(oItem);

  storeDatas.filterProjects(datasKeywordsSelected.value);
  closeMenu()
}

const onClickRemoveItem = (oItem) => {
  console.log('> onClickRemoveItem', oItem.id, oItem.attributes.projets.data);

  datasKeywordsSelected.value.forEach((item, index) => {
    if (oItem.id === item.id) {
      datasKeywordsSelected.value.splice(index, 1);
    }
  })

  storeDatas.filterProjects(datasKeywordsSelected.value);
}

const onClickMenuButton = () => {
  if (isMenuOpened) {
    closeMenu()
  } else {
    openMenu()
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
    autoAlpha: 0
  })
  gsap.to('.keywords__menu__content', {
    delay: 0.5,
    duration: 0.5,
    height: 0,
    top: 45,
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
    top: 45
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
  border: 0;
  padding: 3px 2px;
  &.selected {
    // text-decoration: underline;
    position: relative;
    &::before {
      content: 'x';
      position: absolute;
      left: -15px;
      color: #fff;
    }
  }

  &.disable {
    pointer-events: none;
    background-color: #555;
  }
}

.keywords {  
  position: fixed;
  top: 45px;
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
        right: 97px;
      }

      &__label {
        display: flex;
        font-size: 8px;
        font-weight: 300;
        color: #fff;

        @include media-breakpoint-up(xl) {
          font-size: 10px;
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
      background-color: #000000;
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
      width: 120px;
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

      @include media-breakpoint-up(lg) {
        display: none;
      }
    }
  }
}
</style>