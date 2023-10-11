<template>
  <footer class="footer" ref="footer">
    <div class="footer__top">
      <!-- <div class="footer__top__logo"></div> -->
      <NuxtLink to="/works" class="footer__top__more">Voir tous les projets</NuxtLink>
    </div>

    <div class="footer__bottom">
      <div class="footer__bottom__social">
        <a 
          v-if="linkedin"
          :href="linkedin"
          data-mouse-cursor="hover"
          target="_blank"
          class="footer__bottom__social__link"
        >
          <img src="~/assets/svg/social-linkedin-white.svg" alt="Linkedin" class="footer__bottom__social__link__icon">
        </a>
      </div>
    </div>

    <div class="footer__since">
      Renaud Collet - Web developer since 2004 - ©{{ currentYear }}
    </div>

  </footer>
</template>

<script setup>
import { useDatasStore, S_DATA_CONTACT } from '~/stores/datas';

const storeDatas = useDatasStore();
const { fetchDatas } = storeDatas;
await fetchDatas(S_DATA_CONTACT);
const linkedin = storeDatas.contact.data.attributes.linkedin;

const currentYear = computed(() => {
  return new Date().getFullYear()
})
</script>

<style lang="scss" scoped>
.footer {
  background-color: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 40px;
  padding-bottom: 51px;

  @include media-breakpoint-up(md) {
    padding-top: 60px;
    padding-bottom: 70px;
  }

  @include media-breakpoint-up(xl) {
    padding-top: 48px;
    padding-bottom: 76px;
  }

  &__top {
    display: flex;
    width: 296px;
    margin-bottom: 26px;
    justify-content: center;

    @include media-breakpoint-up(md) {
      width: 82.22vw;
      margin-bottom: 3.62vw;
    }

    @include media-breakpoint-up(xl) {
      width: 1146px;
      margin-bottom: 48px;
    }

    &__logo {
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
    }

    &__more {
      color: $font-color;
      font-weight: 600;
      font-size: 12px;
      text-decoration: none;

      @include media-breakpoint-up(md) {
        font-size: 14px;
      }

      @include media-breakpoint-up(lg) {
        font-size: 20px;
      }

      @include media-breakpoint-up(xl) {
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

  &__bottom {
    width: 296px;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    margin-top: 0;
    justify-content: center;

    @include media-breakpoint-up(md) {
      width: 82.222222vw;
    }

    @include media-breakpoint-up(xl) {
      width: 1146px;
    }

    &__social {
      display: flex;
      align-items: flex-end;

      &__link {
        display: flex;
        align-items: baseline;
        text-decoration: none;
        color: $font-color;

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
            width: 14px;
            height: 14px;
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

  &__since {
    color: $font-color;
    text-decoration: none;
    font-size: 9px;
    display: flex;
    letter-spacing: 0.3px;
    margin-top: 30px;

    @include media-breakpoint-up(md) {
      font-size: 11px;
      margin-top: 40px;
    }

    @include media-breakpoint-up(lg) {
      margin-top: 50px;
      font-size: 11px;
    }

    @include media-breakpoint-up(xl) {
      margin-top: 70px;
      font-size: 11px;
    }
  }
}
</style>