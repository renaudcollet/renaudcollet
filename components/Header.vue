<template>
  <div class="header">
    <NuxtLink id="header-logo" class="header__logo" to="/"
        data-mouse-cursor="hover">
      <Logo class="header__logo__logo" />
    </NuxtLink>
    <div class="header__menu">
      <div 
        class="header__menu__button"
        v-on:click="onClickMenuButton"
        data-mouse-cursor="hover"
      >
        <div class="header__menu__button__label"></div>
      </div>
      <div class="header__menu__content">
        <NuxtLink class="js-menu-item" to="/works" v-on:click="onClickItem"
        data-mouse-cursor="hover">
          <div class="front">Works</div>
          <div class="back">Works</div>
        </NuxtLink>
        <NuxtLink class="js-menu-item" to="/about" v-on:click="onClickItem"
        data-mouse-cursor="hover">
          <div class="front">About</div>
          <div class="back">About</div>
        </NuxtLink>
        <NuxtLink class="js-menu-item" to="/contact" v-on:click="onClickItem"
        data-mouse-cursor="hover">
          <div class="front">Contact</div>
          <div class="back">Contact</div>
        </NuxtLink>
        <div class="header__menu__content__logo js-menu-item">
          <NuxtLink class="logo" to="/" v-on:click="onClickItem">
            <Logo />
          </NuxtLink>
        </div>
      </div>
      <div class="header__menu__zone" v-on:click="closeMenu"></div>
    </div>
    <Keywords :show="bShowKeywords" />

  </div>
</template>

<script setup>

const route = useRouter()
watch(() => route.currentRoute.value, (newValue, oldValue) => {
  // console.log('Header route changed', newValue.name, oldValue.name);
  bShowKeywords.value = newValue.name === 'works'
})

const bShowKeywords = ref(false)

onMounted(() => {
  // console.log('Header mounted composition');
  bShowKeywords.value = route.currentRoute.value.name === 'works'
  // console.log('Header route show keywords', route.currentRoute.value.name, bShowKeywords.value);
})
</script>

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
    console.log('Header mounted');
    gsap.set('.header__menu', { visibility: 'visible' })
    gsap.set('.header__menu__content', { height: 0 })
    gsap.set('.header__menu__zone', { autoAlpha: 0 })

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
      if (this.isDesktop()) return
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
      if (this.isMenuOpened) return

      this.isMenuOpened = true
      gsap.to('.header__menu__zone', {
        duration: 0.2,
        autoAlpha: 1
      })
      gsap.fromTo('.header__menu__content .js-menu-item', {
        autoAlpha: 0,
      }, {
        delay: this.isDesktop() ? 0.2 : 0.3,
        duration: 0.5,
        stagger: -0.1,
        autoAlpha: 1
      })
      gsap.to('.header__menu__content', {
        duration: 0.5,
        height: this.isDesktop() ? 'auto' : window.innerHeight,
        ease: 'power4.out',
        top: 0
      })
    },
    closeMenu() {
      this.isMenuOpened = false
      gsap.to('.header__menu__zone', {
        delay: 0.4,
        duration: 0.5,
        autoAlpha: 0
      })
      gsap.to('.header__menu__content .js-menu-item', {
        duration: 0.4,
        stagger: {
          each: 0.1,
          // from: 'end'
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
    width: fit-content;
    height: fit-content;
    opacity: 0;
    font-family: $font-main;
    text-decoration: none;
    color: #fff;

    @include media-breakpoint-up(lg) {
      margin-top: 30px;
      margin-left: 130px;
    }

    &__logo {
      width: 60px;
      height: 60px;
      
      @include media-breakpoint-up(lg) {
          width: 100px;
          height: 100px;
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
      right: 14px;
      top: 11px;
      padding: 10px;
      transform-origin: right bottom;
      cursor: pointer;

      @include media-breakpoint-up(md) {
        right: 14px;
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
        right: 106px;
      }

      &__label {
        display: flex;
        transform: scaleX(1.3);
        pointer-events: none;
        width: 10px;
        height: 10px;
        background-image: url('~/assets/svg/btn-menu-shadow.svg');
        background-size: contain;
        background-repeat: no-repeat;

        @include media-breakpoint-up(lg) {
          order: 1;
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
        position: relative;

        @include media-breakpoint-up(lg) {
          font-size: 16px;
          font-weight: 500;
          margin-right: 13px;
          position: relative;
          margin-left: 13px;
          padding: 7px 10px 10px;
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

  .front {
    @include media-breakpoint-up(lg) {
      position: relative;
      color: #ffffff;
      z-index: 1;
    }
  }

  .back {
    display: none;

    @include media-breakpoint-up(lg) {
      display: block;
      position: absolute;
      color: #242525;
      top: 1px;
      left: 1px;
      margin: 7px 10px 10px;
    }
  }
}
</style>