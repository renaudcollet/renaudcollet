import { defineStore } from 'pinia'
import { markRaw, toRaw } from 'vue'
import gsap from 'gsap'

// Planes currently closed by removePlanes(), so a plane is never closed (and removed) twice.
// Planes are compared by uuid: curtains sets plane.index to the number of planes at creation,
// so two planes can share an index once some planes have been removed.
const closingPlanes = new Set()

export const useDatasCurtainsStore = defineStore( 'datasCurtains', {

  state: () => ({
    planesToRemove: [],
    curtains: null,
    currentPlaneCover: null,
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
      // Keep the raw curtains plane, no need for a reactive proxy around it
      this.planesToRemove.push(markRaw(toRaw(value)))
    },

    setCurrentPlaneCover(value) {
      // Keep the raw curtains plane, the cover transition calls its methods (resetPlane...)
      this.currentPlaneCover = value ? markRaw(toRaw(value)) : null
    },

    // Close and remove the planes from previous page, except the cover plane (transitions/expand-cover.js)
    removePlanes() {
      this.planesToRemove.forEach(plane => {
        if (this.currentPlaneCover && plane.uuid === this.currentPlaneCover.uuid) return
        if (closingPlanes.has(plane.uuid)) return
        closingPlanes.add(plane.uuid)

        // TODO: Need to shorten duration when leaving work id page (to prevent scroll to top)
        const t = {v: 0.7}
        gsap.to(t, {
          v: 0.0,
          duration: 0.8,
          onUpdate: () => {
            plane.uniforms.uOpenProgress.value = t.v
          },
          onComplete: () => {
            plane.remove();
            closingPlanes.delete(plane.uuid)
            // Empty once every plane is removed, pages wait for it to mount their own planes
            this.planesToRemove = this.planesToRemove.filter(_plane => _plane.uuid !== plane.uuid)
          },
        })
      })
    },

    // The project page now owns the cover plane, the leaving page must not remove it
    adoptCurrentPlaneCover() {
      const uuid = this.currentPlaneCover.uuid
      this.planesToRemove = this.planesToRemove.filter(plane => plane.uuid !== uuid)
    },

    // Hand the cover plane back to removePlanes(), so it closes like the other planes
    releaseCurrentPlaneCover() {
      if (this.currentPlaneCover) {
        this.addPlaneToRemove(this.currentPlaneCover)
        this.currentPlaneCover = null
      }
    },

    removeCurrentPlaneCover() {
      if (this.currentPlaneCover) {
        this.currentPlaneCover.remove();
        this.currentPlaneCover = null
      }
    }
  }
})
