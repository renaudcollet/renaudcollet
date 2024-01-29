<template>
  <footer class="footer" ref="footer">
    <div v-if="$props.projects" class="footer__top">
      <!-- <div class="footer__top__logo"></div> -->
      <NuxtLink to="/work" class="footer__top__more">explorez<br />d'autres cas</NuxtLink>
    </div>

    <div v-if="$props.projects" class="footer__mobile">
      <div class="footer__mobile__row">
        <NuxtLink v-if="$props.projects[0]" :to="getURL($props.projects[0].slug)" class="footer__link" :style="`background-image: url('${getImageURL(0)}');`">
          <div class="footer__link__hover" v-html="getTitle(0)"></div>
        </NuxtLink>
        <NuxtLink v-if="$props.projects[1]" :to="getURL($props.projects[1].slug)" class="footer__link" :style="`background-image: url('${getImageURL(1)}');`">
          <div class="footer__link__hover" v-html="getTitle(1)"></div>
        </NuxtLink>
      </div>
      <div class="footer__mobile__row">
        <NuxtLink v-if="$props.projects[2]" :to="getURL($props.projects[2].slug)" class="footer__link" :style="`background-image: url('${getImageURL(2)}');`">
          <div class="footer__link__hover" v-html="getTitle(2)"></div>
        </NuxtLink>
        <NuxtLink v-if="$props.projects[3]" :to="getURL($props.projects[3].slug)" class="footer__link" :style="`background-image: url('${getImageURL(3)}');`">
          <div class="footer__link__hover" v-html="getTitle(3)"></div>
        </NuxtLink>
      </div>
    </div>

    <div v-if="$props.projects" class="footer__desktop">
      <div class="footer__desktop__row">
        <NuxtLink v-if="$props.projects[0]" :to="getURL($props.projects[0].slug)" class="footer__link" data-scroll-index="0" @mouseover="mouseOverLink(0)" @mouseout="mouseOutLink(0)">
          <div class="footer__link__visual">
            <img :src="getImageURL(0)" alt="">
          </div>
          <div class="footer__link__bg"></div>
          <div class="footer__link__hover" v-html="getTitle(0)"></div>
          <ButtonPlus class="footer__link__btn-plus" :mouseover="oMouseover.desktop[0]"/>
        </NuxtLink>
        <NuxtLink v-if="$props.projects[1]" :to="getURL($props.projects[1].slug)" class="footer__link" data-scroll-index="1" @mouseover="mouseOverLink(1)" @mouseout="mouseOutLink(1)">
          <div class="footer__link__visual">
            <img :src="getImageURL(1)" alt="">
          </div>
          <div class="footer__link__bg"></div>
          <div class="footer__link__hover" v-html="getTitle(1)"></div>
          <ButtonPlus class="footer__link__btn-plus" :mouseover="oMouseover.desktop[1]" />
        </NuxtLink>
        <NuxtLink v-if="$props.projects[2]" :to="getURL($props.projects[2].slug)" class="footer__link" data-scroll-index="2" @mouseover="mouseOverLink(2)" @mouseout="mouseOutLink(2)">
          <div class="footer__link__visual">
            <img :src="getImageURL(2)" alt="">
          </div>
          <div class="footer__link__bg"></div>
          <div class="footer__link__hover" v-html="getTitle(2)"></div>
          <ButtonPlus class="footer__link__btn-plus" :mouseover="oMouseover.desktop[2]" />
        </NuxtLink>
      </div>
      <div class="footer__desktop__row">
        <div class="footer__desktop__col">
          <NuxtLink v-if="$props.projects[3]" :to="getURL($props.projects[3].slug)" class="footer__link" data-scroll-index="3" @mouseover="mouseOverLink(3)" @mouseout="mouseOutLink(3)">
            <div class="footer__link__visual">
              <img :src="getImageURL(3)" alt="">
            </div>
            <div class="footer__link__bg"></div>
            <div class="footer__link__hover" v-html="getTitle(3)"></div>
            <ButtonPlus class="footer__link__btn-plus" :mouseover="oMouseover.desktop[3]" />
          </NuxtLink>
          <NuxtLink v-if="$props.projects[4]" :to="getURL($props.projects[4].slug)" class="footer__link" data-scroll-index="4" @mouseover="mouseOverLink(4)" @mouseout="mouseOutLink(4)">
            <div class="footer__link__visual">
              <img :src="getImageURL(4)" alt="">
            </div>
            <div class="footer__link__bg"></div>
            <div class="footer__link__hover" v-html="getTitle(4)"></div>
            <ButtonPlus class="footer__link__btn-plus" :mouseover="oMouseover.desktop[4]" />
          </NuxtLink>
        </div>
        <NuxtLink v-if="$props.projects[5]" :to="getURL($props.projects[5].slug)" class="footer__link footer__link--big" data-scroll-index="5" @mouseover="mouseOverLink(5)" @mouseout="mouseOutLink(5)">
          <div class="footer__link__visual">
            <img :src="getImageURL(5)" alt="">
          </div>
          <div class="footer__link__bg"></div>
          <div class="footer__link__hover" v-html="getTitle(5)"></div>
          <ButtonPlus class="footer__link__btn-plus" :mouseover="oMouseover.desktop[5]" />
        </NuxtLink>
      </div>
    </div>

    <div class="footer__bottom">
      <div class="footer__bottom__social">
        <a v-if="footer.sections[0].blocks[1].value" :href="footer.sections[0].blocks[1].value" target="_blank" class="footer__bottom__social__link">
          <img src="~/assets/svg/social-facebook-white.svg" alt="Facebook" class="footer__bottom__social__link__icon">
        </a>
        <a v-if="footer.sections[0].blocks[2].value" :href="footer.sections[0].blocks[2].value" target="_blank" class="footer__bottom__social__link">
          <img src="~/assets/svg/social-instagram-white.svg" alt="Instagram" class="footer__bottom__social__link__icon">
        </a>
        <a v-if="footer.sections[0].blocks[0].value" :href="footer.sections[0].blocks[0].value" target="_blank" class="footer__bottom__social__link">
          <img src="~/assets/svg/social-linkedin-white.svg" alt="Linkedin" class="footer__bottom__social__link__icon">
        </a>
      </div>
      <NuxtLink to="/legal" class="footer__bottom__legal">Mentions légales</NuxtLink>
    </div>

  </footer>
</template>

<script>
import gsap from 'gsap'
import ButtonPlus from '~/components/ui/ButtonPlus.vue'

export default {
  components: {
    ButtonPlus
  },
  props: {
    projects: {
      type: Object,
      required: false
    },
    footer: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      intersectionObserver: null,
      oMouseover: {
        desktop: [false, false, false, false, false, false],
      }
    }
  },
  mounted() {
    gsap.set(this.$refs.footer.querySelectorAll('.footer__link__visual'), { height: '0' })
    this.initObserver()
  },
  unmounted() {
    this.clearObserver()
  },
  methods: {  
    getURL(slug) {
      return `/work/${slug}`
    },
    getImageURL(id) {
      return this.$props.projects[id].sections[0].blocks[3].value
    },
    getTitle(id) {
      return this.$props.projects[id].sections[0].blocks[0].value
    },
    initObserver() {
      // Intersection Observer to trigger apparition of the logo on scroll
      this.intersectionObserver = new IntersectionObserver(function (entries) {
        for(let i = 0; i < entries.length; i++) {
          const entry = entries[i]
          if (entry.intersectionRatio > 0) {
            const index = entry.target.dataset.scrollIndex
            gsap.to(entry.target.querySelector('.footer__link__visual'), {
              duration: 0.5,
              delay: index * 0.2 + 0.0,
              height: '100%',
              ease: 'power4.out',
            })
          }
        }
      });

      const targets = Array.from(this.$refs.footer.querySelectorAll('.footer__link'))
      targets.forEach(target => {
        this.intersectionObserver.observe(target, {
          // threshold: [0, 1],
          // rootMargin: '0px 0px -50% 0px',
          // root: document.body
        })
      })
    },
    clearObserver() {
      this.intersectionObserver.disconnect();
    },
    mouseOverLink(id) {
      this.oMouseover.desktop[id] = true
      // const t = {v: 0}
      // gsap.to(t, {
      //   duration: 0.65,
      //   v: 1,
      //   onComplete: () => {
      //     this.oMouseover.desktop[id] = true
      //   }
      // })
    },
    mouseOutLink(id) {
      this.oMouseover.desktop[id] = false
    }
  }
}
</script>

<style lang="scss" scoped>
.footer {
  background-color: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 13px;
  padding-bottom: 51px;

  @include media-breakpoint-up(md) {
    padding-top: 3.611111vw;
    padding-bottom: 14.166667vw;
  }

  @include media-breakpoint-up(xl) {
    padding-top: 48px;
    padding-bottom: 76px;
  }

  &__top {
    display: flex;
    width: 296px;
    margin-bottom: 26px;

    @include media-breakpoint-up(md) {
      width: 82.22vw;
      margin-bottom: 3.62vw;
    }

    @include media-breakpoint-up(xl) {
      width: 1146px;
      margin-bottom: 48px;
    }

    /* &__logo {
      background-image: url('/assets/svg/logo_groupie.svg');
      background-size: contain;
      background-repeat: no-repeat;
      width: 49px;
      height: 16px; 
      margin-left: 23px;

      @include media-breakpoint-up(md) {
        width: 13.611111vw;
        height: 4.444444vw; 
        margin-left: 6.388889vw;
      }

      @include media-breakpoint-up(xl) {
        width: 128px;
        height: 49px;
        margin-left: 65px;
      }
    } */

    &__more {
      color: #fff;
      margin-left: 37px;
      font-weight: 800;
      font-size: 12px;

      @include media-breakpoint-up(md) {
        margin-left: 10.277778vw;
        font-size: 24px;
      }

      @include media-breakpoint-up(xl) {
        font-size: 24px;
        margin-left: 96px;
        margin-top: 5px;
      }
    }
  }

  &__mobile {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 296px;

    @include media-breakpoint-up(md) {
      width: 82vw;
    }

    @include media-breakpoint-up(xl) {
      display: none;
    }

    &__row {
      display: flex;
    }
  }

  &__desktop {
    display: none;

    @include media-breakpoint-up(xl) {
      width: 1146px;
      display: flex;
      flex-direction: column;
      // margin-top: 69px;

      &__row {
        display: flex;
      }

      &__col {
        display: flex;
        flex-direction: column;
      }
    }
  }

  &__link {
    color: #fff;
    width: 148px;
    height: 83px;
    display: flex;
    background-color: #000;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
    font-weight: 800;
    font-size: 12px;
    overflow: hidden;

    @include media-breakpoint-up(md) {
      width: 41.11vw;
      height: 23.05vw;
      font-size: 3.333333vw;
    }

    @include media-breakpoint-up(xl) {
      width: 382px;
      height: 215px;
      font-size: 30px;

      &--big {
        width: 764px;
        height: 430px;
        font-size: 40px;

        .footer__link__hover {
          padding-left: 50px;

          &::after {
            margin-right: 50px;
          }
        }
      }

      &__visual {
        width: 100%;
        height: 100%;
        overflow: hidden;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
        }
      }
    }

    &__hover {
      position: absolute;
      display: flex;
      align-items: center;
      text-decoration: underline;
      // background-color: rgba(0, 0, 0, 0.40);
      // mix-blend-mode: multiply;
      top: 4px;
      left: 4px;
      right: 4px;
      bottom: 4px;
      padding-left: 8px;

      @include media-breakpoint-up(md) {
        top: 1.111111vw;
        left: 1.111111vw;
        right: 1.111111vw;
        bottom: 1.111111vw;
        padding-left: 2.222222vw;
      }

      @include media-breakpoint-up(xl) {
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        padding-left: 25px;
        justify-content: space-between;
        opacity: 0;
        transition: opacity 0.5s 0.1s;

        // For rollover
        transform-origin: left center;
      }
    }

    &__bg {
      position: absolute;
      top: 4px;
      left: 4px;
      right: 4px;
      bottom: 4px;
      background-color: rgba(0, 0, 0, 0.40);
      opacity: 0;
      transition: opacity 0.5s 0.1s;

      @include media-breakpoint-up(md) {
        top: 1.111111vw;
        left: 1.111111vw;
        right: 1.111111vw;
        bottom: 1.111111vw;
      }

      @include media-breakpoint-up(xl) {
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
      }

    }

    &__btn-plus {
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      transform-origin: center center;
      opacity: 0;

      @include media-breakpoint-up(xl) {
        // top: 43%; // hacky to make it look centered
        // transform: scale(0) translateY(-64px);
      }
    }
    
    // @keyframes appearin {
    //   from {
    //     opacity: 0;
    //     filter: blur(30px);
    //     transform: scale3d(2, 2, 2);
    //     line-height: 5;
    //   }

    //   50% {
    //     opacity: 1;
    //   }

    //   to {
    //     opacity: 1;
    //     filter: blur(0px);
    //     transform: scale3d(1, 1, 1);
    //     line-height: 1;
    //   }
    // }

    @include media-breakpoint-up(xl) {
      &:hover {
        
        .footer__link__bg {
          opacity: 1;
          transition: opacity 0.5s;
        }

        .footer__link__hover {
          opacity: 1;
          transition: opacity 0.5s;
          // animation-delay: 0; //250ms;
          // animation-duration: 1s;
          // animation-name: appearin;
          // animation-timing-function: ease-in-out;
          // animation-fill-mode: forwards;
        }
        .footer__link__btn-plus {
          opacity: 1;
          // top: 50%; // hacky to make it look centered
          // transform: scale(1) translateY(-32px);
          // transition: opacity 0.5s 0.1s, transform 0.4s 0.8s;
        }
      }
    }
  }

  &__bottom {
    width: 296px;
    display: flex;
    flex-direction: column;
    margin-top: 20px;

    @include media-breakpoint-up(md) {
      width: 82.222222vw;
      margin-top: 5.555556vw;
    }

    @include media-breakpoint-up(xl) {
      width: 1146px;
      margin-top: 69px;
    }

    &__social {
      display: flex;
      margin-bottom: 20px;

      @include media-breakpoint-up(md) {
        margin-bottom: 5.555556vw;
      }

      @include media-breakpoint-up(xl) {
        margin-bottom: 40px;
      }

      &__link {
        margin-right: 20px;

        @include media-breakpoint-up(md) {
          margin-right: 5.555556vw;
        }

        @include media-breakpoint-up(xl) {
          margin-right: 40px;
        }

        &__icon {
          width: 10px;
          height: 10px;

          @include media-breakpoint-up(md) {
            width: 2.3vw;
            height: 2.3vw;
          }

          @include media-breakpoint-up(xl) {
            width: 20px;
            height: 20px;
          }
        }
      }
    }

    &__legal {
      color:#fff;
      text-decoration: none;
      font-size: 9px;

      @include media-breakpoint-up(md) {
        font-size: 11px;
      }

      @include media-breakpoint-up(xl) {
        margin-top: 20px;
        font-size: 11px;
      }
    }
  }
}
</style>