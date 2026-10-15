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

// Layout owned element the cover plane is bound to while it expands (see transitions/expand-cover.js).
// Unlike the DOM of the leaving page, it survives the page change.
export const coverProxyForTransition = {
  element: null, // HTMLElement
};

// Set by the layout. Pages can't emit to the layout during their leave, they are already unmounted.
export const scrollForTransition = {
  resetToTop: null, // Function
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

    coverProxyForTransition,
    scrollForTransition,
  };
};
