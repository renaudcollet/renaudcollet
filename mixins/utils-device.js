export default {
    computed: {
        isTablet(){
            return process.client && (window.innerWidth < 1025)
        },

        isTouchScreendevice() {    
            return process.client && ('ontouchstart' in window || (navigator.maxTouchPoints > 1))
        },

        isPortrait(){
            return process.client && (window.innerHeight > window.innerWidth)
        },

        supportsCurtains() {
            // return !this.isTablet && !this.isTouchScreendevice && !this.iOS
            return true
        },

        iOS() {
            return process.client && ([
              'iPad Simulator',
              'iPhone Simulator',
              'iPod Simulator',
              'iPad',
              'iPhone',
              'iPod'
            ].includes(navigator.platform)
            // iPad on iOS 13 detection
            || (navigator.userAgent.includes("Mac") && "ontouchend" in document))
        }
    }
}