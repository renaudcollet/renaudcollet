<template>
  <footer class="footer" ref="footer">
    <div class="footer__top">
      <!-- <div class="footer__top__logo"></div> -->
      <NuxtLink to="/works" class="footer__top__more">Voir tous les projets</NuxtLink>
    </div>

    <div class="footer__bottom">
      <div class="footer__bottom__social">
        <a v-if="linkedin" :href="linkedin" target="_blank" class="footer__bottom__social__link">
          <img src="~/assets/svg/social-linkedin-white.svg" alt="Linkedin" class="footer__bottom__social__link__icon">
        </a>
      </div>
      <!-- <NuxtLink to="/legal" class="footer__bottom__legal">Mentions légales</NuxtLink> -->
      <div class="footer__bottom__since">
        Renaud Collet - Web developer since 2004 - ©{{ currentYear }}
      </div>
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
      color: #fff;
      font-weight: 600;
      font-size: 12px;
      text-decoration: none;

      @include media-breakpoint-up(md) {
        font-size: 24px;
      }

      @include media-breakpoint-up(xl) {
        font-size: 24px;
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
    margin-top: 0;

    @include media-breakpoint-up(md) {
      width: 82.222222vw;
    }

    @include media-breakpoint-up(xl) {
      width: 1146px;
    }

    &__social {
      display: flex;

      &__link {
        margin-right: 20px;
        display: flex;
        align-items: flex-end;

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

    &__since {
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