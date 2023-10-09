// import gsap from 'gsap'

/**
 * Usage: 
 * Add 'zoomable' class to the elements containing the image
 * Add 'data-zoomable-url' attribute (optional) to the elements containing the image
 * 
 * <div class="zoomable" data-zoomable-url="https://image-zoom.png"><img src="https://image.png"></div>
 */
export default function useMouseover() {

  let isZoomed = false;
  let zoomableContainer;
  let fClickUnzoomable;
  let fClickZoomable;
  let elZoomables;

  const initMouseover = (elRoot) => {
    elZoomables = elRoot.querySelectorAll('.zoomable');
    // console.log('initMouseover', elZoomables);
    fClickZoomable = onClickZoomable.bind(this);
    elZoomables.forEach((el) => {
      // console.log('initMouseover foreach', el);
      el.addEventListener('click', fClickZoomable);
    });
  }

  const clearMouseover = () => {
    elZoomables.forEach((el) => {
      el.removeEventListener('click', fClickZoomable);
    });
    onClickUnzoomable()
  }

  const onClickUnzoomable = () => {
    if (zoomableContainer) {
      zoomableContainer.style.display = 'none';
      zoomableContainer.removeEventListener('click', fClickUnzoomable);
      zoomableContainer.remove();
      zoomableContainer = null;
    }
    isZoomed = false;
  }

  const onClickZoomable = (e) => {
    if (!isZoomed) {
      const zoomableUrl = e.currentTarget.getAttribute('data-zoomable-url');
      const img = e.currentTarget.querySelector('img');
      const imgSrc = zoomableUrl ? zoomableUrl : img.getAttribute('src');

      // const imgWidth = img.offsetWidth;
      // const imgHeight = img.offsetHeight;
      // const imgNaturalWidth = img.naturalWidth;
      // const imgNaturalHeight = img.naturalHeight;
      // const imgOffset = img.getBoundingClientRect();

      zoomableContainer = document.createElement('div');
      zoomableContainer.classList.add('zoomable-container');
      fClickUnzoomable = onClickUnzoomable.bind(this)
      zoomableContainer.addEventListener('click', fClickUnzoomable)

      const zoomableImage = document.createElement('div');
      zoomableImage.classList.add('zoomable-image');  
      zoomableImage.style.backgroundImage = `url(${imgSrc})`;
      zoomableImage.style.width = `${window.innerWidth}px`
      zoomableImage.style.height = `${window.innerHeight}px`;
      // zoomableImage.style.width = `${imgNaturalWidth}px`
      // zoomableImage.style.height = `${imgNaturalHeight}px`;

      zoomableContainer.appendChild(zoomableImage);

      const zoomableExitButton = document.createElement('div')
      zoomableContainer.appendChild(zoomableExitButton)

      zoomableExitButton.classList.add('zoomable-exit-button')

      document.body.appendChild(zoomableContainer);
      // gsap.to(zoomableImage, { duration: 0.2, scale: 2, ease: 'power4.out' });
      isZoomed = true;
    }
  }

  return {
    isZoomed,
    zoomableContainer,
    initMouseover,
    clearMouseover,
    onClickUnzoomable,
    onClickZoomable
  }
};