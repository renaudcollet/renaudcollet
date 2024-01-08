import { defineStore } from 'pinia'
// import {Vec3} from 'curtainsjs'

export const useDatasCurtainsStore = defineStore( 'datasCurtains', {
  
  state: () => ({
    planesToRemove: [],
    currentPlaneCover: null,
    scrollY: 0,
  }),

  actions: {

    // Add plane to remove, done by custom vue-curtains
    addPlaneToRemove(value) {
        // value.index = this.planesToRemove.length + 20
        this.planesToRemove.push(value)
        console.log('addPlaneToRemove', value, this.planesToRemove.length);
    },
    
    // Remove planes from previous page
    removePlanes() {
      if (this.currentPlaneCover) 
        console.log(`Remove all planes (${this.planesToRemove.length - 1}) except currentPlaneCover - remove it later`, this.currentPlaneCover);
      else
        console.log(`Remove all planes (${this.planesToRemove.length})`);
      
      this.planesToRemove.forEach(plane => {
        if (!this.currentPlaneCover || plane.index !== this.currentPlaneCover.index) {
          // console.log('removePlanes', plane, plane.index);
          plane.remove();
        }

        // https://www.curtainsjs.com/plane-class.html#reset-plane
        // plane.resize();
        // plane.resetPlane(); 
        // plane.setRelativeTranslation(new Vec3(0, -100, 0))
      })
      this.planesToRemove = []
    },
    removeCurrentPlaneCover() {
      if (this.currentPlaneCover) {
        console.log('Remove plane cover', this.currentPlaneCover);
        this.currentPlaneCover.remove();
        this.currentPlaneCover = null
      }
    }
  }
})