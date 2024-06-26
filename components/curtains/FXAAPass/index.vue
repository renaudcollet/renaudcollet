<template>
  <slot />
</template>

<script>
import { onBeforeUnmount, watch } from "vue";
import { useCurtains } from "../hooks";
import { flattenDefaultParams } from "../utils";
import { params } from "./params.js";
import { FXAAPass } from "curtainsjs";

export default {
  name: "FXAAPass",
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
    "after-resize",
    "render",
    "after-render",
    "before-remove",
    "remove",
  ],
  setup(props, { emit }) {
    let fxaaPass;

    const params = flattenDefaultParams(props.params);

    useCurtains((curtains) => {
      emit("before-create");

      fxaaPass = new FXAAPass(curtains, params);

      fxaaPass
        .onError(() => emit("error", fxaaPass))
        .onLoading((texture) => emit("loading", fxaaPass, texture))
        .onReady(() => emit("ready", fxaaPass))
        .onAfterResize(() => emit("after-resize", fxaaPass))
        .onRender(() => emit("render", fxaaPass))
        .onAfterRender(() => emit("after-render", fxaaPass));
    });

    onBeforeUnmount(() => {
      if (fxaaPass) {
        emit("before-remove", fxaaPass);

        // fxaaPass.remove();
      }
    });

    onUnmounted(() => {
      if (fxaaPass) {
        emit("remove", fxaaPass);

        fxaaPass.remove();
      }
    });

    watch(
      () => props.params.renderOrder,
      (newValue) => {
        fxaaPass.setRenderOrder(newValue);
      }
    );
  },
};
</script>
