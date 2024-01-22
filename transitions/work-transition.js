import gsap from 'gsap';

import { useTransitionComposable } from '../compositions/use-transition';

const { 
  toggleTransitionComplete, 
  // toggleTransitionEnterComplete,  
  elementsToTransition,
  functionTransitionCallback } = useTransitionComposable();

export const durationEnterDefault = 0.6;
export const durationLeaveDefault = 0.5;

export const durationEnterWork = 0.5;
export const durationLeaveWork = 0.6;

export const durationEnterWorkId = 0.5;
export const durationLeaveWorkId = 0.6;

/**
 * Inspired by https://stackblitz.com/edit/nuxt-starter-bthjlg
 */

export const workIdTransition = {
  name: 'work-id-transiton',
  mode: 'out-in',
  onEnter: (el, done) => {
    // console.log('workIdTransition onEnter'); 
    
    const t = {v: 0}
    // gsap.set(el, { opacity: 0 });
    gsap
      // .to(el, { opacity: 1, duration: durationEnterWorkId,
      .to(t, { v: 1, duration: durationEnterWorkId,
        onComplete: () => {
          // console.log('workIdTransition onEnter complete');
          toggleTransitionComplete(true);
          done();
        } })
  },
  
  onLeave: (el, done) => {
    // console.log('workIdTransition onLeave');
    // console.log('workIdTransition onLeave elementsToTransition', elementsToTransition.elements.length);
    const t = {v: 0}
    toggleTransitionComplete(false);
    gsap
      .to(elementsToTransition.elements ? elementsToTransition.elements : el, { 
        opacity: 0, delay: 0, /* duration: 0.3, */
        y: '-15',
        stagger: {
          each: 0.1,
          ease: 'power2.outIn',
        },
        onComplete:() => {
          // console.log('workIdTransition onLeave opacity 0 complete');
          elementsToTransition.elements = null;

          if (functionTransitionCallback.function) {
            functionTransitionCallback.function();
            functionTransitionCallback.function = null;
          }

          gsap.to(t, { v: 1, delay: 0.1, duration: durationLeaveWorkId,
            onComplete:() => {
              // console.log('workIdTransition onLeave complete');
              done();
            }})
      }})
  },
};

export const workTransition = {
  name: 'work-transiton',
  mode: 'out-in',
  onEnter: (el, done) => {
    // console.log('workTransition onEnter');
    const t = {v: 0}
    gsap.set(el, { opacity: 0 });
    gsap
      .timeline({
        paused: true,
        onComplete: () => {
          // console.log('workTransition onEnter complete');
          toggleTransitionComplete(true);
          done();
        },
      })
      .to(el, { opacity: 1, duration: durationEnterWorkId })
      // .to(t, { v: 1, duration: durationEnterWork })
      .play();
  },
  onAfterEnter: (el) => {
    gsap.to(el, { delay: 1, opacity: 1 });
  },
  onLeave: (el, done) => {
    // console.log('workTransition onLeave');
    // console.log('workTransition onLeave elementsToTransition', elementsToTransition);
    const t = {v: 0}
    toggleTransitionComplete(false);
    gsap
      .to(elementsToTransition.elements ? elementsToTransition.elements : el, { 
        opacity: 0, delay: 0, /* duration: 0.3, */
        // y: '-15',
        stagger: {
          each: 0.1,
          ease: 'power2.outIn',
        },
        onComplete:() => {
          // console.log('workTransition onLeave opacity 0 complete');
          // toggleTransitionLeaveComplete(true); // This is not watched because the component is already unmounted
          elementsToTransition.elements = null;

          if (functionTransitionCallback.function) {
            functionTransitionCallback.function();
            functionTransitionCallback.function = null;
          }
          
          gsap.to(t, { v: 1, delay: 0.1, duration: durationLeaveWork,
            onComplete:() => {
              console.log('workTransition onLeave complete');
              done();
            }})
      }})
  },
};

export const defaultTransition = {
  name: 'default-transiton',
  mode: 'out-in',
  onEnter: (el, done) => {
    console.log('defaultTransition onEnter');
    gsap.set(el, { opacity: 0 });
    gsap
      .timeline({
        paused: true,
        onComplete() {
          console.log('defaultTransition onEnter complete');
          toggleTransitionComplete(true);
          done();
        },
      })
      .to(el, { opacity: 1, duration: durationEnterDefault })
      .play();
  },
  onLeave: (el, done) => {
    console.log('defaultTransition onLeave');
    console.log('defaultTransition onLeave elementsToTransition', elementsToTransition);
    toggleTransitionComplete(false);
    // toggleTransitionLeaveComplete(false);
    const t = {v: 0}
    gsap
    //   .timeline({ paused: true, onComplete: done })
    //   // .timeline({ paused: true })
    //   .to(el, { opacity: 0, delay: 0, duration: durationLeaveDefault })
    //   .play();
    
      // No need for opacity 0, because plane covers everything
      // TODO: But need opacity when not going to work page id !
    // .to(t, { v: 1, delay: 0, duration: durationLeaveDefault,
    .to(elementsToTransition.elements ? elementsToTransition.elements : el, { 
      opacity: 0, delay: 0, /* duration: 0.3, */
      y: '-15',
      stagger: {
        each: 0.1,
        ease: 'power2.outIn',
      },
      onComplete:() => {
        console.log('defaultTransition onLeave opacity 0 complete');
        // toggleTransitionLeaveComplete(true); // This is not watched because the component is already unmounted
        elementsToTransition.elements = null;

        if (functionTransitionCallback.function) {
          functionTransitionCallback.function();
          functionTransitionCallback.function = null;
        }

        // This is to let the plane animation finish
        // They are the last to disappear
        gsap.to(t, {v:1, duration: 0 /* durationLeaveDefault */, onComplete: () => {
          console.log('defaultTransition onLeave complete');
          done();
        }})
      }})
  },
};

// const pageTransition = {
//   name: 'page-transiton',
//   mode: 'out-in',
//   onEnter: (el, done) => {
//     gsap.set(el, { opacity: 0, scale: 0.8, xPercent: -100 });
//     gsap
//       .timeline({
//         paused: true,
//         onComplete() {
//           toggleTransitionComplete(true);
//           done();
//         },
//       })
//       .to(el, { opacity: 1, xPercent: 0, duration: 0.25 })
//       .to(el, { scale: 1, duration: 0.25 })
//       .play();
//   },
//   onLeave: (el, done) => {
//     toggleTransitionComplete(false);
//     gsap
//       .timeline({ paused: true, onComplete: done })
//       .to(el, { scale: 0.8, duration: 0.2 })
//       .to(el, { xPercent: 100, opacity: 0, duration: 0.2 })
//       .play();
//   },
// };

export default defaultTransition;
