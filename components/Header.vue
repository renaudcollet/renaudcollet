<template>
  <div class="header">
    <NuxtLink id="header-logo" class="header__logo" to="/"></NuxtLink>
    <div class="header__menu">
      <div class="header__menu__button" v-on:click="onClickMenuButton">
        <div class="header__menu__button__arrow">
          <svg width="14px" height="27px" viewBox="0 0 14 27">
            <path fill-rule="evenodd" fill="rgb(255, 255, 255)"
            d="M14.006,26.063 L13.063,26.994 L-0.000,14.095 L0.605,13.497 L-0.000,12.899 L13.063,-0.000 L14.006,0.931 L1.280,13.497 L14.006,26.063 Z"/>
          </svg>
          <svg class="header__menu__button__arrow__right" width="14px" height="27px" viewBox="0 0 14 27">
            <path fill-rule="evenodd" fill="rgb(255, 255, 255)"
             d="M0,0.9L0.9,0L14,12.9l-0.6,0.6l0.6,0.6L0.9,27L0,26.1l12.7-12.6L0,0.9z"/>
          </svg>
        </div>
        <div class="header__menu__button__label">Menu</div>
      </div>
      <div class="header__menu__content">
        <NuxtLink class="menu-item" to="/work" v-on:click="onClickItem">Nos campagnes</NuxtLink>
        <NuxtLink class="menu-item" to="/agence" v-on:click="onClickItem">L'agence</NuxtLink>
        <NuxtLink class="menu-item" to="/contact" v-on:click="onClickItem">Contact</NuxtLink>
        <div class="header__menu__content__logo menu-item">
          <NuxtLink class="logo" to="/" v-on:click="onClickItem"></NuxtLink>
        </div>
      </div>
      <div class="header__menu__zone" v-on:click="closeMenu"></div>
    </div>
  </div>
</template>

<script>
import utilsDevice from '~~/mixins/utils-device.js'
import gsap from 'gsap'

export default {
  name: 'Header',
  props: {},
  data() {
    return {
      isMenuOpened: false
    }
  },
  computed: {
    isDesktop() {
      return window.innerWidth >= 1200
    },
  },
  mixins: [utilsDevice],
  watch: {
    // $route() {
    //   // if (this.isMenuOpened) {
    //   //   this.closeMenu()
    //   // }
    // }
  },
  mounted() {
    gsap.set('.header__menu', { visibility: 'visible' })
    gsap.set('.header__menu__content', { height: 0 })
    gsap.set('.header__menu__zone', { autoAlpha: 0 })
    gsap.set('.header__menu__button__arrow__right', { autoAlpha: 0, transform: 'scale(0)' })

    if (this.isDesktop)
      this.openMenu()
  },
  methods: {
    onClickItem() {
      this.closeMenu()
    },
    onClickMenuButton() {
      if (this.isMenuOpened) {
        this.closeMenu()
      } else {
        this.openMenu()
      }
    },
    openMenu() {
      this.isMenuOpened = true
      gsap.to('.header__menu__zone', {
        duration: 0.2,
        autoAlpha: 1
      })
      gsap.fromTo('.header__menu__content .menu-item', {
        autoAlpha: 0,
      }, {
        delay: 0.3,
        duration: 0.5,
        stagger: 0.1,
        autoAlpha: 1
      })
      gsap.to('.header__menu__content', {
        duration: 0.5,
        height: this.isDesktop ? 'auto' : window.innerHeight,
        ease: 'power4.out',
        top: 0
      })
      gsap.to('.header__menu__button__arrow__right', {
        duration: 0.5,
        autoAlpha: 1,
        // transform: 'translateX(-100%) rotate(180deg) scale(1)',
        transform: 'scale(1)',
      })
    },
    closeMenu() {
      this.isMenuOpened = false
      gsap.to('.header__menu__zone', {
        delay: 0.4,
        duration: 0.5,
        autoAlpha: 0
      })
      gsap.to('.header__menu__content .menu-item', {
        duration: 0.4,
        stagger: {
          each: 0.1,
          from: 'end'
        },
        autoAlpha: 0
      })
      gsap.to('.header__menu__content', {
        delay: 0.5,
        duration: 0.5,
        height: 0,
        top: this.isDesktop ? '-300px' : 0,
        ease: 'power4.out'
      })
      gsap.to('.header__menu__button__arrow__right', {
        delay: 0.6,
        duration: 0.5,
        autoAlpha: 0,
        // transform: 'translateX(-100%) rotate(180deg) scale(0)',
        transform: 'scale(0)',
      })
    },
    // onScroll(e) {
    //   if (window.scrollY > 0) {
    //     this.isScrolled = true
    //   } else {
    //     this.isScrolled = false
    //   }
    // }
  }
}
</script>

<style lang="scss" scoped>
.header {  
  // user-select: none;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: $z-header;
  // height: 30px;

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
  
  &__logo {
    position: fixed;
    top: 0;
    z-index: $z-logo;
    margin-top: 7px;
    margin-left: 60px;
    width: 60px;
    height: 17px;
    background-image: url('/assets/svg/logo_groupie.svg');
    background-repeat: no-repeat;
    background-size: contain;
    opacity: 0;

    @include media-breakpoint-up(xl) {
      margin-top: 30px;
      margin-left: 130px;
      // width: 125px;
      // height: 32px;
      width: 60px;
      height: 20px;
    }
    
    &::before {
      content: '';
      position: absolute;
      display: flex;
      width: 24px;
      height: 1px;
      background-color: #fff;
      left: -30px;
      top: 50%;

      @include media-breakpoint-up(xl) {
        width: 40px;
        left: -50px;
        top: 58%;
      }
    }
  }

  &__menu {

    visibility: hidden;

    &__button {
      position: fixed;
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
        top: 25px;
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
      position: fixed;
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
        // transform: rotate(-90deg);
        flex-direction: row-reverse;
        // right: -105px;
        right: 150px;
        height: fit-content;
        transform: translateY(25px);
        pointer-events: none;
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

      &__logo {
        width: 166px;
        height: 65px;
        // background-image: url('/assets/svg/logo_groupie.svg');
        // background-repeat: no-repeat;
        // background-size: contain;
        margin-top: 20px;

        .logo {
          width: 166px;
          height: 65px;
          background-image: url('/assets/svg/logo_groupie.svg');
          background-repeat: no-repeat;
          background-size: contain;
        }

        @include media-breakpoint-up(xl) {
          display: none;
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