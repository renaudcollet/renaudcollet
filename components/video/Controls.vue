<template>
    <div class="controls controls-hidden" ref="controls">
        <div class="controls-inner">
            <div class="button play" @click="$emit('play')">
                <img src="~/assets/icons/play.svg" alt="" class="play icon" ref="playIcon">
                <img src="~/assets/icons/pause.svg" alt="" class="pause icon" ref="pauseIcon">
            </div>
            <input 
                @input="emitScrub"
                @change="emitScrub"
                class="scrubber" type="range" min="0" max="1" value="0" step="0.000001" ref="scrubber" />
            
            <div class="button btn-sound" ref="sound" @click="$emit('sound')">
                <div class="btn-sound__spectre">
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <rect x="0" y="18" width="2" height="8" />
                        <rect x="4" y="18" width="2" height="14" />
                        <rect x="8" y="18" width="2" height="17" />
                        <rect x="12" y="18" width="2" height="15" />
                        <rect x="16" y="18" width="2" height="11" />
                    </svg>
                </div>
            </div>

            <div v-if="showFullscreenButton" class="button fullscreen" @click="$emit('fullscreen')">
                <img src="~/assets/icons/fullScreenOn.svg" alt="" class="fullscreenOn icon" ref="fullscreenOn">
                <img src="~/assets/icons/fullScreenOff.svg" alt="" class="fullscreenOff icon" ref="fullscreenOff">
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Controls",
    props: {
        showFullscreenButton: {
            type: Boolean,
            default: true
        }
    },

    mounted() {
        this.scrubber = this.$refs.scrubber
        this.playIcon = this.$refs.playIcon;
        this.pauseIcon = this.$refs.pauseIcon;
        this.fullscreenOn = this.$refs.fullscreenOn;
        this.fullscreenOff = this.$refs.fullscreenOff;
        this.sound = this.$refs.sound;
        this.controls = this.$refs.controls;
    },

    methods: {
        emitScrub(e) {
            this.$emit('scrub', e.target.value);
        },
        scrubTo(playhead) {
            this.scrubber.value = playhead;
            this.$emit('scrub', playhead);
        },
        updatePlayhead(playhead) {
            this.scrubber.value = playhead;
            this.scrubber.style.backgroundSize = playhead * 100 + '% 100%';
        },
        updateIcon(type, value) {
            switch (type) {
                case 'play':
                    this.playIcon.style.display = value ? 'none' : 'block';
                    this.pauseIcon.style.display = value ? 'block' : 'none';
                    break;
                case 'fullscreen':
                    this.fullscreenOn.style.display = value ? 'none' : 'block';
                    this.fullscreenOff.style.display = value ? 'block' : 'none';
                    break;
                case 'sound':
                    this.sound.classList.toggle('mute', value)
                    break;
                default:
                    break;
            }
        },

        showControls() {
            this.controls.classList.remove('controls-hidden');
            if(this.hideControls) 
                clearTimeout(this.hideControls);
            this.hideControls = setTimeout(() => {
                this.controls.classList.add('controls-hidden');
            }, 3000);
        },

    }
}
</script>


<style lang="scss" scoped="true">
.controls {
  /* position: fixed; */
  position: absolute;
  z-index: $z-video-controls;
  bottom: 0;
  // top: 100%;
  transition: opacity 0.5s ease-out;
  left: 0px;
  width: 100%;
  user-select: none;

  @include media-breakpoint-up(xl) {
    // top: auto;
    bottom: 10px;
  }
}

.controls-hidden {
  opacity: 0;
  transition: opacity 0.1s ease-out;
}

.controls-inner {
  height: 50px;
  width: 95%;
  max-width: 600px;
  background: #141415;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0px auto;
  padding: 0px 20px;
  box-sizing: border-box;
  opacity: 0.85;
}


.scrubber {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  position: relative;
  flex: 1;
  width: 100%;
  height: 3px;
  margin: 0px 5px;
  background: #ffffff;
  border-radius: 10px;
  background-image: linear-gradient(90deg,#ff2166, #ff2166);
  background-size: 0% 100%;
  background-repeat: no-repeat;
  cursor: pointer;
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5));
}

.scrubber::-webkit-slider-thumb {
  -webkit-appearance: none; /* Override default look */
  appearance: none;
  width: 0; /* Set a specific slider handle width */
  height: 0; /* Slider handle height */
  background: #bebebe; /* Green background */
  cursor: pointer; /* Cursor on hover */
  border-radius: 50%;
}

.scrubber::-moz-range-thumb {
  width: 0; /* Set a specific slider handle width */
  height: 0; /* Slider handle height */
  // background: #bebebe; /* Green background */
  cursor: pointer; /* Cursor on hover */
  border-radius: 50%;
}
.scrubber::-ms-thumb {
  width: 0;
  height: 0;
  padding: 0.25em;                                              /* largeur du bord */
  border: 1px solid #888;
  border-radius: 50%;
  box-shadow: 0 0 .5em #FFF inset;
  // background: linear-gradient(#888, #FFF) content-box,          /* le centre */
  //             linear-gradient(-90deg, #888, #DDD) border-box;   /* le bord */
}

.icon {
  width: 100%;
  height: 100%;
}


.pause,
.fullscreenOn {
    display: none;
}

.menu-hidden {
  display: none;
}

.button {
  width: 30px;
  height: 30px;
  margin: 0 5px;
  cursor: pointer;
  filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5));
}


/**
    Button audio
 */
@keyframes audiospectre_play {
  from {
    height: 1px;
  }
  to {
    height: 18px;
  }
}

@keyframes audiospectre_pause {
  from {
    height: 18px;
  }
  to {
    height: 1px;
  }
}

.btn-sound {
  display: flex;
  width: 30px;
  height: 30px;
  justify-content: center;
  align-items: center;

  &__spectre {
    display: flex;
    width: 30px;
    height: 30px;
    align-items: center;
    justify-content: center;

    svg {
      fill: #fff;
    }
  }
}
.btn-sound__spectre rect {
  transform: scaleY(-100%);
  transform-origin: bottom center;
}

/*
Sound animations 
*/
.btn-sound__spectre rect:nth-child(1) {
  animation: 0.3s linear 0.5s infinite alternate audiospectre_play;
}
.btn-sound__spectre rect:nth-child(2) {
  animation: 0.2s linear 0.3s infinite alternate audiospectre_play;
}
.btn-sound__spectre rect:nth-child(3) {
  animation: 0.3s linear 0.2s infinite alternate audiospectre_play;
}
.btn-sound__spectre rect:nth-child(4) {
  animation: 0.2s linear 0.4s infinite alternate audiospectre_play;
}
.btn-sound__spectre rect:nth-child(5) {
  animation: 0.3s linear 0.1s infinite alternate audiospectre_play;
}
.mute .btn-sound__spectre rect {
  height: 1px;
  animation: 0.5s linear audiospectre_pause;
}
@media (min-width: 992px) {
  .btn-sound {
    right: 15px;
    top: 9px;
    cursor: pointer;
  }
}
</style>