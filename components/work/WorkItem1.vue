<template>
  <div class="work-item-1">
    <div class="work-item-1__context">
      <div class="work-item-1__context__image scroll-opacity scroll-opacity--no-translate" data-scroll-index="0">
        <ClientOnly>
          <ImagePlane 
            :src="src" 
            :onRender="onRender" 
            alt=""
          />
        </ClientOnly>
      </div>
      <div class="work-item-1__context__col z-index-text">
        <h3 class="work-item-1__context__title scroll-opacity" data-scroll-index="1">Contexte</h3>
        <p class="work-item-1__context__text scroll-opacity" data-scroll-index="2" v-html="context"></p>
      </div>
    </div>
    <div v-if="answer !== ''" class="work-item-1__answer z-index-text">
      <h3 class="work-item-1__answer__title scroll-opacity" data-scroll-index="0">Notre réponse</h3>
      <p class="work-item-1__answer__text scroll-opacity"  data-scroll-index="1" v-html="answer"></p>
    </div>
  </div>
</template>

<script>
import ImagePlane from '~/components/webgl/ImagePlane.vue';
import utilsDevice from '~~/mixins/utils-device.js';

export default {
  components: {
    ImagePlane,
  },
  mixins: [utilsDevice],
  props: {
    src: {
      type: String,
      required: true,
    },
    context: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    onRender: {
      type: Function,
      required: true,
    },
  }
}
</script>

<style lang="scss">
.work-item-1 {
  &__context {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #000;
    
    @include media-breakpoint-up(lg) {
      flex-direction: row;
      align-items: flex-start;
      padding-top: 140px;
      padding-left: 17.5vw;
      // padding-left: 21.96vw;
      padding-bottom: 160px;
    }
    
    @include media-breakpoint-up(xl) {
      padding-left: 280px;
    }

    &__col {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;

      @include media-breakpoint-up(lg) {
          // width: 49%;
          width: auto;
      }
    }

    &__title {
      text-align: center;
      font-weight: 300;
      font-size: 10px;
      text-decoration: underline;
      color: #fff;
      margin-bottom: 14px;
      margin-top: 20px;

      @include media-breakpoint-up(lg) {
        font-size: 18px;
        text-align: left;
      }
    }

    &__image {
      width: 41vw;
      height: 23vw;
      object-fit: contain;
      margin-top: 37px;

      @include media-breakpoint-up(lg) {
        display: flex;
        order: 2;
        width: 26vw;
        margin-top: auto;
        margin-bottom: auto;
      }

      @include media-breakpoint-up(xl) {
          // width: 335px;
          // height: 188px;
          width: 350px;
          height: 222px;
          margin-left: 1vw;
      }

      @include media-breakpoint-up(xxl) {
          // width: 335px;
          // height: 188px;
          width: 350px;
          height: 222px;
          margin-left: 3vw;
      }
    }
    &__text {
      font-size: 14px;
      line-height: 1.5;
      margin: 0 60px 60px;
      text-align: center;
      font-weight: normal;

      @include media-breakpoint-up(lg) {
        font-size: 28px;
        text-align: left;
        margin-left: 0;
        margin-top: 50px;
        width: 34.99vw;
        line-height: 1.1;
        font-weight: 600;
        margin-bottom: 0;
      }
      
      @include media-breakpoint-up(xl) {
        width: 30vw;
      }
    }
}
&__answer {
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #2b2a2b;

    &__title {
        text-align: center;
        font-weight: 300;
        font-size: 10px;
        text-decoration: underline;
        color: #fff;
        margin-bottom: 20px;
        margin-top: 30px;

        @include media-breakpoint-up(lg) {
            margin-top: 60px;
            margin-bottom: 40px;
            font-size: 18px;
        }
    }
    &__text {
        font-size: $font-size-text-sm;
        line-height: 1.5;
        margin: 0 60px 30px;
        text-align: center;
        font-weight: normal;
        @include media-breakpoint-up(md) {
            font-size: $font-size-text-md;
            line-height: 1.2;
            margin-bottom: 50px;
        }
        @include media-breakpoint-up(lg) {
            font-size: $font-size-text-lg;
            width: 56vw;
            margin-bottom: 104px;
        }
        @include media-breakpoint-up(xl) {
            width: 756px;
        }
    }
  }
}
</style>