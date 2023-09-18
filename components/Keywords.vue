<template>
  <div class="keywords">
    <div class="keywords__menu">
      <div class="keywords__menu__button" v-on:click="onClickMenuButton">
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
        <div class="keywords__menu__button__label">Filtres</div>
      </div>
      <div class="keywords__menu__content">
        <template v-for="(item, index) in datasKeywords" :key="index">
          <button 
            v-if="item.attributes.projets.data.length > 0" 
            class="menu-item" 
            v-on:click="onClickItem($event, item.id, item.attributes.projets.data)"
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

let isMenuOpened = false
let isDesktop = computed(() => window.innerWidth >= 1200)

let selectedItemElement = null

const onClickItem = ($event, idKey, aProjects) => {
  console.log('onClickItem', $event, idKey, aProjects);
  storeDatas.filterProjects(aProjects);

  if (selectedItemElement) {
    selectedItemElement.classList.remove('selected');
  }
  selectedItemElement = $event.target;
  selectedItemElement.classList.add('selected');

  closeMenu()
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
    top: isDesktop ? '-300px' : 0,
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

const onClickMenuButton = () => {
  if (isMenuOpened) {
    closeMenu()
  } else {
    openMenu()
  }
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
    height: isDesktop ? 'auto' : window.innerHeight,
    ease: 'power4.out',
    top: 40
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

  if (isDesktop)
    openMenu()
})
</script>

<style lang="scss" scoped>
.keywords {  
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: $z-header;

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

    @include media-breakpoint-up(lg) {
      display: none;
    }
  }

  &__menu {

    visibility: hidden;

    &__button {
      position: absolute;
      z-index: $z-menu-button;
      display: flex;    
      align-items: center;
      right: 2px;
      top: 3px;
      // right: 20px;
      // top: -5px;
      padding: 10px;
      transform-origin: right bottom;
      transform: rotate(-90deg);
      cursor: pointer;

      @include media-breakpoint-up(md) {
        right: 10px;
        top: 10px;
      }

      @include media-breakpoint-up(xl) {
        transform-origin: center;
        transform: rotate(0);
        // flex-direction: column;
        flex-direction: row-reverse;
        top: 60px;
        right: 105px;
      }

      &__label {
        display: flex;
        font-size: 8px;
        font-weight: 300;
        color: #fff;

        @include media-breakpoint-up(md) {
          font-size: 11px;
        }

        @include media-breakpoint-up(xl) {
          font-size: 14px;
          font-weight: 400;
          order: 1;
        }
      }

      &__arrow {
        display: flex;
        margin-right: 10px;
        position: relative;

        @include media-breakpoint-up(xl) {
          order: 2;
          // transform: rotate(-90deg);
          // margin-top: 10px;
          margin-right: 10px;
        }

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
      position: absolute;
      z-index: $z-menu;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 600px;
      background-color: #a51b48;
      overflow: hidden;

      @include media-breakpoint-up(xl) {
        background-color: transparent;
        width: auto;
        flex-direction: row-reverse;
        right: 185px;
        height: fit-content;
        transform: translateY(25px);
        pointer-events: none;
      }

      .menu-item {
        pointer-events: all;
        cursor: pointer;
        &.selected {
          text-decoration: underline;
        }
      }
      
      a {
        font-size: 21px;
        font-weight: 800;
        color: #fff;
        display: flex;
        text-decoration: none;
        margin-bottom: 15px;

        @include media-breakpoint-up(xl) {
          font-size: 14px;
          font-weight: 300;
          margin-right: 45px;
          position: relative;
          margin-left: 20px;
          padding: 10px;
          pointer-events: all;

          &:hover {
            // text-decoration: underline;
            &::before {
              transition: transform 0.3s;
              transform: scale(1.2);
            }

            &::after {
              width: calc(100% - 20px);
              transition: width 0.2s 0s;
            }
          }

          &::before {
            content: '';
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #fff;
            border-radius: 10px;
            left: -7px;
            top: 12px;
            
            transform-origin: center;
            transition: transform 0.3s;
            transform: scale(1);
          }

          &::after {
            content: '';
            position: absolute;
            background-color: #fff;
            width: 0;
            height: 1px;
            top: 25px;
            transition: width 0.2s 0.2s;
          }

          &:nth-child(1) {
            order: 3;
          }
          &:nth-child(2) {
            order: 2;
          }
          &:nth-child(3) {
            order: 1;
          }
        }
      }
    }

    &__zone {
      background-color: rgba(0, 0, 0, 0.65);
      position: fixed;
      width: 100%;
      height: 100vh;
      z-index: $z-menu-zone;

      @include media-breakpoint-up(xl) {
        display: none;
      }
    }
  }
}
</style>