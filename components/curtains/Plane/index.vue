<template>
  <div ref="planeEl">
    <slot />
  </div>
</template>

<script>
import { ref, inject, onBeforeUnmount, onUnmounted, watch, toRaw, useSlots, defineExpose } from "vue";
import { useCurtains } from "../hooks";
import { flattenDefaultParams } from "../utils";
import { params } from "./params.js";
import { Plane } from "curtainsjs";
import { useDatasCurtainsStore } from "~/stores/datasCurtains";

export default {
  name: "Plane",
  props: {
    params: {
      type: Object,
      default: params,
    },
  },
  emits: [
    "before-create",
    "error",
    "loading",
    "ready",
    "leave-view",
    "re-enter-view",
    "after-resize",
    "render",
    "after-render",
    "before-remove",
    "remove"
  ],
  setup(props, { emit }) {
    let plane;

    const planeEl = ref(null);

    const renderTarget = inject("renderTarget", null);

    const params = flattenDefaultParams(props.params);
    
    const storeDatasCurtains = useDatasCurtainsStore();

    const setRenderTarget = (target) => {
      if (target.renderer) {
        plane.setRenderTarget(target);
      }
    };

    useCurtains((curtains) => {
      emit("before-create");

      plane = new Plane(curtains, planeEl.value, params);

      const rt =
        renderTarget && renderTarget.value
          ? renderTarget && renderTarget.value
          : params.target
          ? params.target
          : null;
      if (rt) {
        setRenderTarget(toRaw(rt));
      }

      plane
        .onError(() => emit("error", plane))
        .onLoading((texture) => emit("loading", plane, texture))
        .onReady(() => {
          // console.log("ready", plane);
          emit("ready", plane)
        })
        .onAfterResize(() => emit("after-resize", plane))
        .onLeaveView(() => {
          // console.log("leave-view", plane);
          emit("leave-view", plane)
        })
        .onReEnterView(() => {
          // console.log("re-enter-view", plane);
          emit("re-enter-view", plane)
        })
        .onRender(() => {
          emit("render", plane)
        })
        .onAfterRender(() => emit("after-render", plane));
    });

    onBeforeUnmount(() => {
      if (plane) {
        // console.log("on before unmount", planeEl.value);
        
        // Need to delay the remove because of how transitions work in vuejs
        // ie: onBeforeUnmount and onUnmounted are called before the transition is finished
        storeDatasCurtains.addPlaneToRemove(plane)
        emit("before-remove", plane);
        
        // plane.remove();
      }
    });

    // watch simple properties
    [
      "alwaysDraw",
      "cullFace",
      "drawCheckMargins",
      "visible",
      "watchScroll",
    ].forEach((prop) => {
      watch(
        () => props.params[prop],
        (newValue) => {
          // console.log(prop, newValue);
          plane[prop] = newValue;
        }
      );
    });

    // other properties
    watch(
      () => props.params.depthTest,
      (newValue) => {
        // console.log("depthTest", newValue);
        plane.enableDepthTest(newValue);
      }
    );

    watch(
      () => props.params.renderOrder,
      (newValue) => {
        // console.log("renderOrder", newValue);
        plane.setRenderOrder(newValue);
      }
    );

    // render target
    watch(
      () => props.params.target,
      (newValue) => {
        // console.log("target", newValue);
        setRenderTarget(newValue);
      },
      { deep: true }
    );

    watch(
      () => renderTarget,
      (newValue) => {
        if (newValue.value) {
          // console.log("renderTarget", newValue.value);
          setRenderTarget(toRaw(newValue.value));
        }
      },
      { deep: true }
    );

    return {
      planeEl,
    };
  },
};
</script>
