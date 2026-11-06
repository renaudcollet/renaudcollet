import { defineStore } from 'pinia'
import { markRaw, toRaw } from 'vue'
import gsap from 'gsap'

// Planes currently closed by removePlanes(), so a plane is never closed (and removed) twice.
// Planes are compared by uuid: curtains sets plane.index to the number of planes at creation,
// so two planes can share an index once some planes have been removed.
const closingPlanes = new Set()

// curtains clears the whole canvas when it removes a plane (Renderer.removePlane()). Called from a gsap
// tween, the removal can land after curtains has drawn the frame (each runs its own requestAnimationFrame
// loop): the cleared canvas is then shown for one frame, a random black flash of the whole screen.
// curtains runs its nextRender queue at the start of render(), before drawing: remove the plane there.
const removeBeforeNextDraw = (curtains, plane, onRemoved) => {
  const remove = () => {
    plane.remove()
    onRemoved && onRemoved()
  }
  if (curtains) toRaw(curtains).nextRender(remove)
  else remove()
}

export const useDatasCurtainsStore = defineStore( 'datasCurtains', {

  state: () => ({
    planesToRemove: [],
    curtains: null,
    // null until curtains has tried to get a WebGL context, false without one (no GPU)
    webglAvailable: null,
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
            removeBeforeNextDraw(this.curtains, plane, () => {
              closingPlanes.delete(plane.uuid)
              // Empty once every plane is removed, pages wait for it to mount their own planes
              this.planesToRemove = this.planesToRemove.filter(_plane => _plane.uuid !== plane.uuid)
            })
          },
        })
      })
    },

    // Remove right away a plane that is never seen closing (VideoPlane: the html video is drawn above it).
    // Left in planesToRemove, it would stay there until the page is left, and everything gated on an
    // empty list (bMountPlanes, the project page cover) would unmount meanwhile
    removePlaneNow(value) {
      const plane = toRaw(value)
      if (closingPlanes.has(plane.uuid)) return
      this.planesToRemove = this.planesToRemove.filter(_plane => _plane.uuid !== plane.uuid)
      removeBeforeNextDraw(this.curtains, plane)
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
        const uuid = this.currentPlaneCover.uuid
        // Already closing in removePlanes(), which removes it at the end of its animation
        if (!closingPlanes.has(uuid)) {
          removeBeforeNextDraw(this.curtains, this.currentPlaneCover);
          // Leaving the project page before it adopted the cover (back during the expansion):
          // the cover is still listed by the page it came from, and the next page would wait
          // forever for planesToRemove to empty before mounting its planes
          this.planesToRemove = this.planesToRemove.filter(plane => plane.uuid !== uuid)
        }
        this.currentPlaneCover = null
      }
    }
  }
})
