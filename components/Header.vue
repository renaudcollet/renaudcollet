<template>
  <div class="header">
    <NuxtLink id="header-logo" class="header__logo" to="/">
      <!-- <svg height="50" width="50">
        <polygon points="0,50 25,0 50,50" fill="none" stroke="#fff" stroke-width="1" />
      </svg>
      <span>Renaud COLLET</span> -->
      <Logo />
    </NuxtLink>
    <div class="header__menu">
      <div 
        class="header__menu__button"
        v-on:click="onClickMenuButton"
        data-mouse-cursor="hover"
      >
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
        <div class="header__menu__button__label">Ξ</div>
      </div>
      <div class="header__menu__content">
        <NuxtLink class="menu-item" to="/works" v-on:click="onClickItem">Works</NuxtLink>
        <NuxtLink class="menu-item" to="/about" v-on:click="onClickItem">About</NuxtLink>
        <NuxtLink class="menu-item" to="/contact" v-on:click="onClickItem">Contact</NuxtLink>
        <div class="header__menu__content__logo menu-item">
          <NuxtLink class="logo" to="/" v-on:click="onClickItem">
            <Logo />
          </NuxtLink>
        </div>
      </div>
      <div class="header__menu__zone" v-on:click="closeMenu"></div>
    </div>
    <Keywords />

  </div>
</template>

<script>
// import utilsDevice from '~~/mixins/utils-device.js'
import gsap from 'gsap'

export default {
  name: 'Header',
  data() {
    return {
      isMenuOpened: false
    }
  },
  mounted() {
    gsap.set('.header__menu', { visibility: 'visible' })
    gsap.set('.header__menu__content', { height: 0 })
    gsap.set('.header__menu__zone', { autoAlpha: 0 })
    gsap.set('.header__menu__button__arrow__right', { autoAlpha: 0, transform: 'scale(0)' })

    if (this.isDesktop())
      this.openMenu()

    window.addEventListener('resize', this.onResize)
  },
  methods: {
    isDesktop() {
      return window.innerWidth >= 992
    },
    onResize() {
      if (!this.isDesktop()) {
        this.closeMenu()
      }
    },
    onClickItem() {
      // this.closeMenu()
    },
    onClickMenuButton() {
      if (this.isMenuOpened) {
        this.closeMenu()
      } else {
        this.openMenu()
      }
    },
    openMenu() {
      if (this.isMenuOpened) return

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
        height: this.isDesktop() ? 'auto' : window.innerHeight,
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
        top: this.isDesktop() ? '-300px' : 0,
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
    margin-left: 10px;
    width: 60px;
    height: 17px;
    opacity: 0;
    font-family: $font-main;
    text-decoration: none;
    color: #fff;

    @include media-breakpoint-up(lg) {
      margin-top: 30px;
      margin-left: 130px;
      width: 90px;
      height: 20px;
    }
  }

  &__menu {

    visibility: hidden;

    &__button {
      position: fixed;
      z-index: $z-menu-button;
      display: flex;    
      align-items: center;
      right: 5px;
      top: 3px;
      padding: 10px;
      transform-origin: right bottom;
      cursor: pointer;

      @include media-breakpoint-up(md) {
        right: 10px;
        top: 10px;
      }

      @include media-breakpoint-up(lg) {
        transform-origin: center;
        transform: rotate(0);
        flex-direction: row-reverse;
        top: 20px;
        right: 8px;
      }

      @include media-breakpoint-up(xl) {
        top: 25px;
        right: 105px;
      }

      &__label {
        display: flex;
        font-size: 20px;
        font-weight: 300;
        color: #fff;
        font-family: sans-serif;
        transform: scaleX(1.5);
        pointer-events: none;

        @include media-breakpoint-up(md) {
          font-size: 11px;
        }

        @include media-breakpoint-up(lg) {
          font-size: 14px;
          font-weight: 400;
          order: 1;
        }
      }

      &__arrow {
        display: flex;
        margin-right: 10px;
        position: relative;
        display: none;

        @include media-breakpoint-up(lg) {
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
      background-color: #1e2122;
      overflow: hidden;
      padding: 0;

      @include media-breakpoint-up(lg) {
        background-color: transparent;
        width: auto;
        flex-direction: row-reverse;
        right: 70px;
        height: fit-content;
        transform: translateY(20px);
        pointer-events: none;
        padding: 0;
      }

      @include media-breakpoint-up(xl) {
        right: 150px;
        transform: translateY(25px);
      }

      a {
        font-size: 21px;
        font-weight: 800;
        color: #fff;
        display: flex;
        text-decoration: none;
        margin-bottom: 15px;
        justify-content: center;

        @include media-breakpoint-up(lg) {
          font-size: 14px;
          font-weight: 300;
          margin-right: 20px;
          position: relative;
          margin-left: 20px;
          padding: 10px;
          pointer-events: all;

          &:hover,
          &.router-link-active {
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
        height: 150px;
        margin-top: 20px;
        font-family: $font-main;
        text-decoration: none;

        .logo {
          width: 166px;
          height: 145px;
          // background-image: url('/assets/svg/logo_groupie.svg');
          // background-repeat: no-repeat;
          // background-size: contain;
        }

        @include media-breakpoint-up(lg) {
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

      @include media-breakpoint-up(lg) {
        display: none;
      }
    }
  }
}
</style>