import gsap from 'gsap';

import { useTransitionComposable } from '../compositions/use-transition';

const { toggleTransitionComplete } = useTransitionComposable();

export const durationEnterDefault = 1;
export const durationLeaveDefault = 1;

/**
 * Inspired by https://stackblitz.com/edit/nuxt-starter-bthjlg
 */

export const workTransition = {
  name: 'work-transiton',
  mode: 'out-in',
  onEnter: (el, done) => {
    gsap.set(el, { autoAlpha: 0 });
    gsap
      .timeline({
        paused: true,
        onComplete() {
          toggleTransitionComplete(true);
          done();
        },
      })
      .to(el, { autoAlpha: 1, duration: durationEnterDefault })
      .play();
  },
  onLeave: (el, done) => {
    toggleTransitionComplete(false);
    gsap
      .timeline({ paused: true, onComplete: done })
      // .timeline({ paused: true })
      .to(el, { autoAlpha: 0, delay: 0, duration: durationLeaveDefault })
      .play();
  },
};

export const defaultTransition = {
  name: 'default-transiton',
  mode: 'out-in',
  onEnter: (el, done) => {
    gsap.set(el, { autoAlpha: 0 });
    gsap
      .timeline({
        paused: true,
        onComplete() {
          toggleTransitionComplete(true);
          done();
        },
      })
      .to(el, { autoAlpha: 1, duration: durationEnterDefault })
      .play();
  },
  onLeave: (el, done) => {
    toggleTransitionComplete(false);
    gsap
      .timeline({ paused: true, onComplete: done })
      // .timeline({ paused: true })
      .to(el, { autoAlpha: 0, delay: 0, duration: durationLeaveDefault })
      .play();
  },
};

// const pageTransition = {
//   name: 'page-transiton',
//   mode: 'out-in',
//   onEnter: (el, done) => {
//     gsap.set(el, { autoAlpha: 0, scale: 0.8, xPercent: -100 });
//     gsap
//       .timeline({
//         paused: true,
//         onComplete() {
//           toggleTransitionComplete(true);
//           done();
//         },
//       })
//       .to(el, { autoAlpha: 1, xPercent: 0, duration: 0.25 })
//       .to(el, { scale: 1, duration: 0.25 })
//       .play();
//   },
//   onLeave: (el, done) => {
//     toggleTransitionComplete(false);
//     gsap
//       .timeline({ paused: true, onComplete: done })
//       .to(el, { scale: 0.8, duration: 0.2 })
//       .to(el, { xPercent: 100, autoAlpha: 0, duration: 0.2 })
//       .play();
//   },
// };

export default defaultTransition;
