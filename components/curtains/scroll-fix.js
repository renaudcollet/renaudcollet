import { Plane } from "curtainsjs";

/**
 * curtains stores a plane position relative to the viewport when it measures its html element, then
 * moves it by the scroll deltas of the window scroll event. Lenis scrolls the window on each frame, but
 * the scroll event only comes on the next frame: a plane measured in between (ImagePlane.appear() while
 * the scroll is restored with an animation, back on /works or the home page) already has the new scroll
 * in its rect, and the late event moves it once more by that frame's delta. The plane is drawn off its
 * element, over the next project item.
 *
 * Sync curtains with the window scroll right before a plane is measured: the other planes get the delta
 * now, and the late event has none left to apply.
 */
let curtainsInstance = null;

export const setScrollSyncCurtains = (curtains) => {
  curtainsInstance = curtains;
};

const setDocumentSizes = Plane.prototype._setDocumentSizes;

if (!setDocumentSizes.__syncScroll) {
  Plane.prototype._setDocumentSizes = function () {
    // No scroll manager without a WebGL context (no plane either)
    const scroll = curtainsInstance && curtainsInstance._scrollManager && curtainsInstance.getScrollValues();
    if (scroll && (scroll.x !== window.pageXOffset || scroll.y !== window.pageYOffset)) {
      curtainsInstance.updateScrollValues(window.pageXOffset, window.pageYOffset);
    }
    return setDocumentSizes.call(this);
  };
  Plane.prototype._setDocumentSizes.__syncScroll = true;
}
