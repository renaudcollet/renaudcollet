<template>
  <div class="page">
    <section>
      <div class="block">
        <div class="header-minimize" data-header-scroll-minimize></div>
        <h1 class="title-agence" data-scroll-index="0">Mentions légales<sub class="big-underscore">&nbsp;—</sub></h1>

        <h2>Éditeur du site</h2>
        <p>
          Renaud Collet, développeur web freelance.<br>
          SIRET : {{ siret }}<br>
          Adresse : {{ address }}<br>
          Contact : <a href="mailto:hello@renaudcollet.com">hello@renaudcollet.com</a><br>
          Directeur de la publication : Renaud Collet
        </p>

        <h2>Hébergement</h2>
        <p>
          Le site est hébergé par IONOS SARL, 7 place de la Gare, 57200 Sarreguemines, France.<br>
          Site : <a href="https://www.ionos.fr" target="_blank" rel="noopener">www.ionos.fr</a>
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          L'ensemble des contenus présents sur ce site (textes, images, vidéos, animations et code)
          est la propriété de Renaud Collet ou de ses clients respectifs, sauf mention contraire.
          Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite
          préalable est interdite.
        </p>

        <h2>Données personnelles</h2>
        <p>
          Ce site ne collecte aucune donnée personnelle via un formulaire. Les échanges se font
          par email ou par téléphone, à votre initiative. Conformément au RGPD, vous disposez d'un
          droit d'accès, de rectification et de suppression des données que vous m'auriez
          transmises, en écrivant à <a href="mailto:hello@renaudcollet.com">hello@renaudcollet.com</a>.
        </p>

        <h2>Mesure d'audience</h2>
        <p>
          Ce site utilise Google Analytics afin de mesurer la fréquentation des pages.
          Les données collectées sont anonymisées et ne sont pas cédées à des tiers.
        </p>
      </div>
    </section>
    <FooterSimple />
  </div>
</template>

<script>
import gsap from 'gsap';
import utilsDevice from '~~/mixins/utils-device.js';
import scrollHeaderMinimize from '~~/mixins/scroll-header-minimize';
import useSeo from '~/compositions/use-seo';

export default {
  setup() {
    // Nothing is awaited here on purpose: in an Options API setup() there is no
    // withAsyncContext() wrapper, so a composable called after an await would lose
    // the component instance (this is what broke the previous useHead() call).
    useSeo({
      title: 'Mentions légales',
      description: "Mentions légales du site renaudcollet.com : éditeur, hébergeur, propriété intellectuelle et traitement des données personnelles.",
      noindex: true,
    })

    return {
      // TODO: à compléter avec les informations réelles avant mise en ligne
      siret: 'XXX XXX XXX XXXXX',
      address: 'À compléter',
    }
  },

  mounted() {
    gsap.killTweensOf('#header-logo')
    gsap.to('#header-logo', { autoAlpha: 1 })
  },

  mixins: [
    utilsDevice,
    scrollHeaderMinimize
  ],
};
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
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 60px;
  padding-top: 30vh;

  @include media-breakpoint-up(lg) {
    padding-top: 160px;
    margin-bottom: 150px;
  }

  @include media-breakpoint-up(xl) {
    margin-bottom: 150px;
  }

  .block {
    width: 100%;
    margin-bottom: 50px;
    position: relative;

    &:last-child {
      margin-bottom: 0;
    }

    @include media-breakpoint-up(lg) {
      margin-bottom: 105px;
      width: 60.6vw;
    }

    @include media-breakpoint-up(xl) {
      margin-bottom: 105px;
      width: 60.6vw;
    }
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 23px;
    margin-left: 30px;
    width: calc(100% - 60px);

    @include media-breakpoint-up(lg) {
      font-size: 72px;
      line-height: 0.9;
    }

    @include media-breakpoint-up(xl) {
      font-size: 72px;
    }
  }

  h2 {
    position: relative;
    font-size: 14px;
    text-decoration: underline;
    line-height: 1.2;
    margin-left: 60px;
    margin-bottom: 20px;

    &::before {
      content: '';
      position: absolute;
      width: 20px;
      height: 2px;
      background-color: #fff;
      top: -13px;
    }

    @include media-breakpoint-up(md) {
      font-size: 16px;
    }

    @include media-breakpoint-up(lg) {
      font-size: 22px;
    }

    @include media-breakpoint-up(xl) {
      font-size: 28px;
    }
  }

  a {
    color: inherit;
    text-decoration: underline;

    &:hover {
      color: $font-title-color;
    }
  }

  p {
    @include font-main();

    & {
      font-weight: 300;
      margin-bottom: 30px;
      margin-left: 60px;
      width: calc(100% - 120px);
    }

    @include media-breakpoint-up(lg) {
      font-size: 16px;
    }

    @include media-breakpoint-up(xl) {
      font-size: 16px;
    }

    .font-groupie {
      font-size: 15px;

      @include media-breakpoint-up(lg) {
        font-size: 18px;
      }

      @include media-breakpoint-up(xl) {
        font-size: 18px;
      }
    }
  }
}
</style>