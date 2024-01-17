import gsap from 'gsap';

import { useTransitionComposable } from '../compositions/use-transition';

const { toggleTransitionComplete } = useTransitionComposable();

export const durationEnterDefault = 1;
export const durationLeaveDefault = 0.5;

export const durationEnterWork = 0.5;
export const durationLeaveWork = 0.8;

export const durationEnterWorkId = 0.5;
export const durationLeaveWorkId = 0.5;

/**
 * Inspired by https://stackblitz.com/edit/nuxt-starter-bthjlg
 */

export const workIdTransition = {
  name: 'work-id-transiton',
  mode: 'out-in',
  onEnter: (el, done) => {
    console.log('workIdTransition onEnter');    
    const t = {v: 0}
    gsap.set(el, { opacity: 0 });
    gsap
      // .timeline({
      //   paused: true,
      //   onComplete: () => {
      //     // console.log('workIdTransition onEnter complete');
      //     toggleTransitionComplete(true);
      //     done();
      //   },
      // })
      .to(el, { opacity: 1, duration: durationEnterWorkId,
      // .to(t, { v: 1, duration: durationEnterWorkId,
        onComplete: () => {
          // console.log('workIdTransition onEnter complete');
          toggleTransitionComplete(true);
          done();
        } })
    //   // .play();
    // setTimeout(() => {
    //   console.log('workIdTransition onEnter complete');
    //   toggleTransitionComplete(true);
    //   done();
    // }, 1000 * durationEnterWorkId);
  },
  onLeave: (el, done) => {
    console.log('workIdTransition onLeave');
    const t = {v: 0}
    toggleTransitionComplete(false);
    gsap
      // .timeline({ paused: true, onComplete:() => {
      //   // console.log('workIdTransition onLeave complete');
      //   done();
      // } })
      // .timeline({ paused: true })
      .to(el, { opacity: 0, delay: 0, duration: durationLeaveWorkId,
      // .to(t, { v: 1, delay: 0, duration: durationLeaveWorkId, 
        onComplete:() => {
          // console.log('workIdTransition onLeave complete');
          done();
        } })
      // .play();
    // setTimeout(() => {
    //   console.log('workIdTransition onLeave complete');
    //   done();
    // }, 1000 * durationLeaveWorkId);
  },
};
export const workTransition = {
  name: 'work-transiton',
  mode: 'out-in',
  onEnter: (el, done) => {
    console.log('workTransition onEnter');
    const t = {v: 0}
    gsap.set(el, { opacity: 0 });
    gsap
      .timeline({
        paused: true,
        onComplete: () => {
          console.log('workTransition onEnter complete');
          toggleTransitionComplete(true);
          done();
        },
      })
      .to(el, { opacity: 1, duration: durationEnterWorkId })
      // .to(t, { v: 1, duration: durationEnterWork })
      .play();
    // setTimeout(() => {
    //   console.log('workTransition onEnter complete');
    //   toggleTransitionComplete(true);
    //   done();
    // }, 1000 * durationEnterWork);
  },
  onAfterEnter: (el) => {
    gsap.to(el, { delay: 1, opacity: 1 });
  },
  onLeave: (el, done) => {
    console.log('workTransition onLeave');
    const t = {v: 0}
    toggleTransitionComplete(false);
    gsap
      .timeline({ paused: true, onComplete:() => {
        console.log('workTransition onLeave complete');
        done();
      } })
      // .timeline({ paused: true })
      .to(el, { opacity: 0, delay: 0, duration: durationLeaveWork })
      // .to(t, { v: 1, delay: 0, duration: durationLeaveWork })
      .play();
    // setTimeout(() => {
    //   console.log('workTransition onLeave complete');
    //   done();
    // }, 1000 * durationLeaveWork);
  },
};

export const defaultTransition = {
  name: 'default-transiton',
  mode: 'out-in',
  onEnter: (el, done) => {
    gsap.set(el, { opacity: 0 });
    gsap
      .timeline({
        paused: true,
        onComplete() {
          toggleTransitionComplete(true);
          done();
        },
      })
      .to(el, { opacity: 1, duration: durationEnterDefault })
      .play();
  },
  onLeave: (el, done) => {
    toggleTransitionComplete(false);
    gsap
      .timeline({ paused: true, onComplete: done })
      // .timeline({ paused: true })
      .to(el, { opacity: 0, delay: 0, duration: durationLeaveDefault })
      .play();
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
