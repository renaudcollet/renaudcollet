import gsap from 'gsap'

/**
 * Usage: 
 * Add 'zoomable' class to the elements containing the image
 * Add 'data-zoomable-url' attribute (optional) to the elements containing the image
 * 
 * <div class="zoomable" data-zoomable-url="https://image-zoom.png"><img src="https://image.png"></div>
 */
export default {
  data() {
    return {
      isZoomed: false,
      zoomableContainer: null,
      fClickUnzoomable: null,
      fClickZoomable: null,
    }
  },
  mounted() {
    this.$nextTick(() => {
      const zoomable = this.$el.querySelectorAll('.zoomable');
      this.fClickZoomable = this.onCickZoomable.bind(this);
      zoomable.forEach((el) => {
        el.addEventListener('click', this.fClickZoomable);
      });
    })
  },

  unmounted() {
    const zoomable = this.$el.querySelectorAll('.zoomable');
    zoomable.forEach((el) => {
      el.removeEventListener('click', this.fClickZoomable);
    });
    this.onClickUnzoomable()
  },

  methods: {
    onClickUnzoomable(e) {
      if (this.zoomableContainer) {
        this.zoomableContainer.style.display = 'none';
        this.zoomableContainer.removeEventListener('click', this.fClickUnzoomable);
        this.zoomableContainer.remove();
        this.zoomableContainer = null;
      }
      this.isZoomed = false;
    },
    onCickZoomable(e) {
      if (!this.isZoomed) {
        const zoomableUrl = e.currentTarget.getAttribute('data-zoomable-url');
        const img = e.currentTarget.querySelector('img');
        const imgSrc = zoomableUrl ? zoomableUrl : img.getAttribute('src');

        // const imgWidth = img.offsetWidth;
        // const imgHeight = img.offsetHeight;
        // const imgNaturalWidth = img.naturalWidth;
        // const imgNaturalHeight = img.naturalHeight;
        // const imgOffset = img.getBoundingClientRect();

        this.zoomableContainer = document.createElement('div');
        this.zoomableContainer.classList.add('zoomable-container');
        this.fClickUnzoomable = this.onClickUnzoomable.bind(this)
        this.zoomableContainer.addEventListener('click', this.fClickUnzoomable)

        const zoomableImage = document.createElement('div');
        zoomableImage.classList.add('zoomable-image');  
        zoomableImage.style.backgroundImage = `url(${imgSrc})`;
        zoomableImage.style.width = `${window.innerWidth}px`
        zoomableImage.style.height = `${window.innerHeight}px`;
        // zoomableImage.style.width = `${imgNaturalWidth}px`
        // zoomableImage.style.height = `${imgNaturalHeight}px`;

        this.zoomableContainer.appendChild(zoomableImage);

        const zoomableExitButton = document.createElement('div')
        this.zoomableContainer.appendChild(zoomableExitButton)

        zoomableExitButton.classList.add('zoomable-exit-button')

        document.body.appendChild(this.zoomableContainer);
        // gsap.to(zoomableImage, { duration: 0.2, scale: 2, ease: 'power4.out' });
        this.isZoomed = true;
      }
    }
  },
};