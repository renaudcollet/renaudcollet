import gsap from 'gsap';

import { coverProxyForTransition, scrollForTransition } from '../compositions/use-transition';
import { useDatasCurtainsStore } from '../stores/datasCurtains';
import { updatePlaneRatio } from '../js/plane-utils';
import { durationLeaveWork } from './work-transition';

/**
 * Cover transition, from a project item to the project page cover, with a single plane.
 *
 * A curtains plane reads its size and position on its html element, and an element detached
 * from the DOM reports a 0x0 rect: a plane still bound to the leaving page collapses on its next
 * resize. So the plane is handed over between elements:
 * 1. expandCover() binds it to a fixed proxy owned by the layout, which survives the page change,
 *    and expands the proxy to fullscreen. The scroll is then reset to the top.
 * 2. adoptCover() binds it to the cover element of the project page.
 * Each handover happens between two identical rects, so it can't be seen.
 */

const lerp = (v0, v1, t) => {
  return v0 + t * (v1 - v0);
}

const syncPlane = (plane) => {
  updatePlaneRatio(plane);
  plane.resize();
}

export const expandCover = (plane) => {
  const proxy = coverProxyForTransition.element;
  const storeDatasCurtains = useDatasCurtainsStore();

  // Where the plane is drawn, its html element may already be moved by the leave animation
  const pixelRatio = plane.renderer.pixelRatio;
  const rect = plane.getBoundingRect();
  const rectFinal = plane.renderer.canvas.getBoundingClientRect();

  gsap.set(proxy, {
    top: rect.top / pixelRatio,
    left: rect.left / pixelRatio,
    width: rect.width / pixelRatio,
    height: rect.height / pixelRatio,
  });

  // The proxy is fixed, the scroll must not move the plane anymore
  plane.watchScroll = false;
  plane.resetPlane(proxy);
  plane.setRenderOrder(1);

  const scale = plane.uniforms.uScale.value;

  return new Promise((resolve) => {
    const tween = gsap.to(proxy, {
      duration: durationLeaveWork,
      ease: 'power4.out',
      top: 0,
      left: 0,
      width: rectFinal.width,
      height: rectFinal.height,
      onUpdate: () => {
        plane.uniforms.uScale.value = lerp(scale, 1, tween.progress());
        syncPlane(plane);
      },
      onComplete: () => {
        syncPlane(plane);

        // Planes still closing behind the cover must not follow the scroll reset
        storeDatasCurtains.planesToRemove.forEach(_plane => {
          _plane.watchScroll = false;
        });

        // The cover sits at the top of the project page
        scrollForTransition.resetToTop();
        resolve();
      },
    });
  });
}

export const isCoverOnProxy = (plane) => {
  return !!plane && plane.htmlElement === coverProxyForTransition.element;
}

export const adoptCover = (plane, element) => {
  const proxy = coverProxyForTransition.element;

  const bind = () => {
    plane.resetPlane(element);
    plane.watchScroll = true;
    updatePlaneRatio(plane);
  }

  const target = element.getBoundingClientRect();
  const current = proxy.getBoundingClientRect();
  const isAligned = ['top', 'left', 'width', 'height'].every(key => Math.abs(target[key] - current[key]) < 0.5);

  if (isAligned) {
    bind();
    return Promise.resolve();
  }

  // Safety net, the cover may not be exactly the size of the canvas (100vh on mobile for instance):
  // move the proxy onto the cover before the handover
  return new Promise((resolve) => {
    gsap.to(proxy, {
      duration: 0.3,
      ease: 'power2.out',
      top: target.top,
      left: target.left,
      width: target.width,
      height: target.height,
      onUpdate: () => {
        syncPlane(plane);
      },
      onComplete: () => {
        bind();
        resolve();
      },
    });
  });
}
