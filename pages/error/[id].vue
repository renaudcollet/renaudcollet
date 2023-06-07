<template>
  <div class="page">
    <section>
      <div class="header-minimize" data-header-scroll-minimize></div>
      <h1>Erreur {{ id }}<sub class="big-underscore">&nbsp;—</sub></h1>
      <p v-if="id == 404">La page que vous cherchez n'existe pas.</p>
      <p v-else>Une erreur s'est produite.</p>
    </section>
  </div>  
</template>

<script>
import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';

export default {
  setup() {
    const route = useRoute()
    const id = route.params.id

    return {
      id,
    }
  },
  mixins: [
    scrollHeaderMinimize,
  ]
}
</script>

<style lang="scss" scoped>
.header-minimize {
  position: absolute;
  top: 30vh;
  width: 10px;
  height: 10px;
}
section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 60px;

  @include media-breakpoint-up(md) {
    width: auto;
    margin-right: auto;
    margin-left: auto;
    height: 100vh;
    align-items: center;
  }

  @include media-breakpoint-up(lg) {
    width: auto;
    margin-right: auto;
    margin-left: 40%;
    align-items: flex-start;
  }

  @include media-breakpoint-up(xl) {
    width: auto;
    margin-right: auto;
    margin-left: 45%;
    height: 100vh;
  }

  h1 {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 41px;
    margin-top: 45vh;

    @include media-breakpoint-up(md) {
      font-size: 72px;
      margin-top: 10vh;
    }

    @include media-breakpoint-up(xl) {
      font-size: 72px;
      margin-top: 10vh;
    }
  }

  p {
    text-align: center;
    font-size: 14px;
    font-weight: 300;
    margin-bottom: 26px;
    user-select: all;

    @include media-breakpoint-up(md) {
      text-align: left;
      font-size: 22px;
      width: auto;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.15;
      text-align: center;
    }

    @include media-breakpoint-up(lg) {
      width: auto;
      text-align: left;
      margin-left: 0;
      margin-right: auto;
    }

    @include media-breakpoint-up(xl) {
      line-height: 1.15;
    }
  }

  span {
    display: inline-flex;
  }

  a {
    display: inline-flex;
    color: #ffffff;
    text-decoration: none;
  }
}
</style>