import { defineStore } from 'pinia'
// import {Vec3} from 'curtainsjs'

export const useDatasCurtainsStore = defineStore( 'datasCurtains', {
  
  state: () => ({
    planesToRemove: [],
    currentPlaneCover: null,
    scrollY: 0,
  }),

  actions: {
    addPlaneToRemove(value) {
        // value.index = this.planesToRemove.length + 20
        this.planesToRemove.push(value)
        // console.log('addPlaneToRemove', value, this.planesToRemove);
    },
    removePlanes() {
      if (this.currentPlaneCover) 
        console.log('currentPlaneCover', this.currentPlaneCover, this.currentPlaneCover.index);

      this.planesToRemove.forEach(plane => {
        if (plane.index !== this.currentPlaneCover.index) {
          // console.log('removePlanes', plane, plane.index);
          plane.remove();
        } else {
          setTimeout(() => {
            console.log('removePlanes currentPlaneCover');
            this.currentPlaneCover.remove();
            this.currentPlaneCover = null
          }, 1000);
        }

        // https://www.curtainsjs.com/plane-class.html#reset-plane
        // plane.resize();
        // plane.resetPlane(); 
        // plane.setRelativeTranslation(new Vec3(0, -100, 0))
      })
      this.planesToRemove = []
    },
  }
})