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
    // toggleTransitionLeaveComplete,
    elementsToTransition,
    functionTransitionCallback,
  };
};
