<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error" @click="handleError">
    <h1>Oops ! There was an error...</h1>
    <h2>{{ error.statusCode }}</h2>
    <button @click="handleError">Return to homepage ></button>
  </div>
</template>

<style lang="scss" scoped>
body .error {
    cursor: pointer !important;
}
.error {
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    
    width: 100%;
    height: 100vh;
    background-image: url('~/assets/images/magnific-bBTEtSfmqvSyHZCoYVna-about.jpeg');
    background-size: cover;
    background-position: 25% center;
    background-repeat: no-repeat;
    padding: 30px;
    text-align: center;

    animation: error 3s ease-in-out infinite;

    @keyframes error {
        0% {
            background-position: 25% center;
        }
        25% {
            background-position: 60% center;
        }
        50% {
            background-position: 25% center;
        }
    }

    @include media-breakpoint-up(lg) {
        background-position: center;
        animation: none;
    }
}

h1 {
    font-size: 40px;
    margin-bottom: 0px;

    @include media-breakpoint-up(lg) {
        background-size: cover;
        font-size: 60px;
    }
}

h2 {
    font-size: 20vw;
    font-weight: 800;
    margin-top: 10px;

    @include media-breakpoint-up(lg) {
        background-size: cover;
        font-size: 60px;
    }
}

button {
    background: transparent;
    border: 0;
    color: #fff;
    font-weight: 600;
    font-size: 20px;
}
</style>