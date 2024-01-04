import { defineStore } from 'pinia'

export const useDatasCurtainsStore = defineStore( 'datasCurtains', {
  
  state: () => ({
    planesToRemove: [],
  }),

  actions: {
    addPlaneToRemove(value) {
        // value.index = this.planesToRemove.length - 1
        this.planesToRemove.push(value)
        // console.log('addPlaneToRemove', value, this.planesToRemove);
    },
    removePlanes() {
      this.planesToRemove.forEach(plane => {
        plane.remove();
      })
      this.planesToRemove = []
    },
  }
})