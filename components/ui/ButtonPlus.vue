<template>
    <div class="button-plus" :class="{'button-plus--hover': mouseover}">
        <svg x="0px" y="0px" viewBox="0 0 124 124">
            <circle fill="rgb(255, 255, 255)" cx="62" cy="62" r="52"/>
            <rect class="horiz" fill="rgb(0, 0, 0)" x="42" y="62" width="41" height="1"/>
            <g class="vert">
                <rect class="vert1" fill="rgb(0, 0, 0)" x="62" y="42" width="1" height="20"/>
                <rect class="vert2" fill="rgb(0, 0, 0)" x="62" y="62" width="1" height="20"/>
            </g>
        </svg>
    </div>
</template>

<script>
export default {
  props: {
    mouseover: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss">
$button-plus-delay-start: 0.4s;
$button-plus-delay-anim: 0.4s;

    .button-plus {
        svg {
          width: 31px;
          height: 31px;

          @include media-breakpoint-up(md) {
            width: 8.611111vw;
            height: 8.611111vw;
          }

          @include media-breakpoint-up(lg) {
            width: 64px;
            height: 64px;
          }

          @include media-breakpoint-up(xl) {
            width: 64px;
            height: 64px;
          }
        
          circle {
              transition: r 0.3s ease;
              // r: 60;
          }
          .horiz {
              transition: opacity 0.3s 0.2s ease, transform 0.3s 0.2s ease, width 0.3s 0.2s ease;
              // opacity: 0;
              // transform: translateX(-10px);
              // width: 0;
          }
          .vert1 {
              transition: transform 0.3s 0.0s ease;
              transform-origin: center;
              // transform: rotate(-45deg);
          }
          .vert2 {
              transition: transform 0.3s 0.0s ease;
              transform-origin: center;
              // transform: rotate(45deg);
          }
          .vert {
              transition: transform 0.3s ease;
              // transform: translateX(20px);
          }
        }

        &--hover {
            svg {
                circle {
                    transition: r 0.3s $button-plus-delay-start ease;
                    r: 60;
                }
                .horiz {
                    transition: opacity 0.3s $button-plus-delay-anim ease, transform 0.3s $button-plus-delay-anim ease, width 0.3s $button-plus-delay-anim ease;
                    opacity: 0;
                    transform: translateX(-10px);
                    width: 0;
                }
                .vert1 {
                    transition: transform 0.3s $button-plus-delay-start ease;
                    transform-origin: center;
                    transform: rotate(-45deg);
                }
                .vert2 {
                    transition: transform 0.3s $button-plus-delay-start ease;
                    transform-origin: center;
                    transform: rotate(45deg);
                }
                .vert {
                    transition: transform 0.3s $button-plus-delay-start ease;
                    transform: translateX(10px);
                }
            }
        }
    }
</style>