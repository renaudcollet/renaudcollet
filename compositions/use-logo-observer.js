import gsap from 'gsap';

export default function useLogoObserver() {

    let ioLogo = null

    const initLogoObserver = () => {
        // header-logo is in Header.vue
        gsap.set('#header-logo', { autoAlpha: 0 })
        // Intersection Observer to trigger reveal of the logo on scroll
        ioLogo = new IntersectionObserver((entries) => {
            if (entries[0].intersectionRatio === 0) {
                hideCoverLogo()
                showHeaderLogo()
            } else {
                hideHeaderLogo()
                showCoverLogo()
            }
        });
        ioLogo.observe(document.querySelector('#index-logo'));
    }
    const clearLogoObserver = () => {
        ioLogo.disconnect();
    }
    const hideHeaderLogo = () => {
        gsap.killTweensOf('#header-logo')
        gsap.to('#header-logo', {
            duration: 1,
            translateX: -20,
            autoAlpha: 0,
            ease: 'power4.out',
        })
    }
    const showHeaderLogo = () => {
        gsap.killTweensOf('#header-logo')
        gsap.to('#header-logo', {
            duration: 1,
            translateX: 0,
            autoAlpha: 1,
            ease: 'power4.out',
        })
    }
    const hideCoverLogo = () => {
        gsap.killTweensOf('#index-logo')
        gsap.to('#index-logo', { translateX: '-50%', opacity: 0 })
    }
    const showCoverLogo = () => {
        gsap.killTweensOf('#index-logo')
        gsap.to('#index-logo', { delay: 0.1, duration: 2, translateX: '-125%', ease: 'power2.out', opacity: 1 })
    }

    return {
        initLogoObserver,
        clearLogoObserver,
        hideHeaderLogo,
        showHeaderLogo,
        hideCoverLogo,
        showCoverLogo
    }
}