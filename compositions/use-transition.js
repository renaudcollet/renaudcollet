import { reactive } from 'vue';

// No transition to start, set default to true.
export const transitionState = reactive({
  transitionComplete: false,
  transitionEnterComplete: false,
  // transitionLeaveComplete: false, // Cannot be used because component is unmounted before transition is complete
});

export const elementsToTransition = {
  elements: null, // Array or element
};

export const functionTransitionCallback = {
  function: null, // Function
};
export const curtainsForTransition = {
  curtains: null, // Function
};

// This is a workaround to avoid black flash when going to work id page
export const backgroundForTransition = {
  element: null, // HTMLElement
  imgData: null, // ImageData
};

export const useTransitionComposable = () => {
  const toggleTransitionComplete = (value) => {
    transitionState.transitionComplete = value;
  };
  // const toggleTransitionLeaveComplete = (value) => {
  //   transitionState.transitionEnterComplete = value;
  // };

  const toggleTransitionEnterComplete = (value) => {
    transitionState.transitionLeaveComplete = value;
  };

  return {
    transitionState,
    toggleTransitionComplete,
    toggleTransitionEnterComplete,
    // toggleTransitionLeaveComplete, // Not doable with vue transitions, on leave element doesn't exist anymore

    elementsToTransition,
    functionTransitionCallback,

    curtainsForTransition,
    backgroundForTransition,
  };
};
