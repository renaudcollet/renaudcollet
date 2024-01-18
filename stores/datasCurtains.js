import { defineStore } from 'pinia'
// import {Vec3} from 'curtainsjs'
import gsap from 'gsap'

export const useDatasCurtainsStore = defineStore( 'datasCurtains', {
  
  state: () => ({
    planesToRemove: [],
    curtains: null,
    currentPlaneCover: null,
    currentCoverTexture: null,
    scrollY: 0,
    scrollToTopCompleteAfterTransition: true,
  }),

  actions: {

    setCurtains(curtains) {
      // console.log('setCurtains', curtains);
      this.curtains = curtains
    },

    // Add plane to remove, done by custom vue-curtains
    addPlaneToRemove(value) {
        // value.index = this.planesToRemove.length + 20
        this.planesToRemove.push(value)
        // console.log('addPlaneToRemove', value, this.planesToRemove.length);
    },
    
    setCurrentPlaneCover(value) {
      this.currentPlaneCover = value
      // this.currentPlaneCover.resetPlane()
      // console.log('setCurrentPlaneCover', value);
      // console.log('--> cover texture', value.textures[0]);

      // TODO: Maybe do this to avoid black flash with cover texture
      // Get texture once expanded
      // Copy it to the render target
      // this.currentCoverTexture = value.textures[0]

      // console.log(`Curtains disable drawing`);
      // this.curtains.disableDrawing();

      // console.log(`Curtains contains ${this.curtains.planes.length} planes`);
    },

    // Remove planes from previous page
    removePlanes() {
      // if (this.currentPlaneCover) 
      //   console.log(`Remove all planes (${this.planesToRemove.length - 1}) except currentPlaneCover - remove it later`, this.currentPlaneCover);
      // else
      //   console.log(`Remove all planes (${this.planesToRemove.length})`);

      this.planesToRemove.forEach(plane => {
        if (!this.currentPlaneCover || plane.index !== this.currentPlaneCover.index) {
          // console.log('removePlanes', plane, plane.index);

          // Update z of all the planes except the cover
          // plane.uniforms.uZPos.value = 0.001 // Not working for home page...

          // TODO: Need to shorten duration when leaving work id page (to prevent scroll to top)

          const t = {u: 0, v: 0.7}
          gsap.to(t, {
            v: 0.0,
            duration: 0.8,
            delay: 0,
            onUpdateParams: [plane],
            onUpdate: (_plane) => {
                _plane.uniforms.uOpenProgress.value = t.v
            },
            onCompleteParams: [plane],
            onComplete: (_plane) => {
                _plane.uniforms.uOpenProgress.value = t.v
                _plane.remove();
                this.planesToRemove = []
                // console.log(`Remove planes ${_plane.index} complete`);
                // console.log(`Curtains ${this.curtains.planes.length} planes left`);
            },
          })
        }

        // https://www.curtainsjs.com/plane-class.html#reset-plane
        // plane.resize();
        // plane.resetPlane(); 
        // plane.setRelativeTranslation(new Vec3(0, -100, 0))
      })
    },
    removeCurrentPlaneCover() {
      if (this.currentPlaneCover) {
        console.log(`REMOVE PLANE COVER`);
        // console.log(`Curtains contains ${this.curtains.planes.length} planes before remove cover`);
        // this.currentPlaneCover.visible = false
        this.currentPlaneCover.remove();
        this.currentPlaneCover = null
      }
    }
  }
})