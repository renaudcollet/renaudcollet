<template>
  <div class="work-item-title" :class="{'small' : type === 'Small'}">
    <div class="work-item-title__answer z-index-text">
      <h3 
        class="work-item-title__answer__title scroll-reveal"
        data-scroll-reveal-opacity-y
        data-scroll-reveal-delay="0.2"
        data-scroll-reveal-duration="0.5"
      >
        {{ title }}
      </h3>
      <div 
        v-if="content"
        class="work-item-title__answer__text scroll-reveal"
        data-scroll-reveal-opacity-y
        data-scroll-reveal-delay="0.2"
        data-scroll-reveal-duration="0.5"
        v-html="content"
      ></div>
    </div>
  </div>
</template>

<script>
/* 
  Component : title and/or Resume 
*/
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
  }
}
</script>

<style lang="scss">
.work-item-title { 
  &__answer {
      display: flex;
      flex-direction: column;
      align-items: center;
      // background-color: #2b2a2b;

      &__title {
          text-align: center;
          font-weight: 300;
          font-size: 24px;
          // text-decoration: underline;
          margin-bottom: 20px;
          margin-top: 30px;
          font-weight: 700;

          .small & {
            font-size: 16px;
            margin-top: 20px;
            margin-bottom: 10px;
          }

          @include media-breakpoint-up(lg) {
              margin-top: 60px;
              margin-bottom: 40px;
              font-size: 60px;

              .small & {
                font-size: 30px;
                margin-bottom: 20px;
              }
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