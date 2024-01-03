import { defineStore } from 'pinia'

export const useDatasCurtainsStore = defineStore( 'datasCurtains', {
  
  state: () => ({
    planesToRemove: [],
    planesToAdd: [],
  }),

  actions: {
    addPlaneToRemove(value) {
        value.index = this.planesToRemove.length + 20
        this.planesToRemove.push(value)
        // console.log('addPlaneToRemove', value, this.planesToRemove);
    },
    addPlaneToAdd(value) {
        // if (this.planesToRemove === null) {
        //     this.planesToRemove = []
        // }
        // value.index = this.planesToRemove.length + 20
        // this.planesToRemove.push(value)
        // console.log('addPlaneToRemove', value, this.planesToRemove);
    },
  }
})