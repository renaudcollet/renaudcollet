<template>
    <div class="logo"></div>
</template>

<style scoped lang="scss">
.logo {
    width: 60px;
    height: 60px;
    background-image: url('~/assets/svg/logo-renaudcollet-2024_contour_white3.svg');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    
    @include media-breakpoint-up(lg) {
        width: 100px;
        height: 100px;
    }
}
</style>