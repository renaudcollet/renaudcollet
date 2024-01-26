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
      default: '',
    },
    type: {
      type: String,
      required: false,
    },
    index: {
      type: Number,
      required: false,
      default: 0,
    }
  }
}
</script>

<style></style>