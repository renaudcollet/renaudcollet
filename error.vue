<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="error" @click="handleError">
    <div class="container">
        <h1>{{ error.statusCode }}</h1>
        <h2 v-if="error.statusCode == '404'">La page que vous cherchez n'existe pas.</h2>
        <h2 v-else>Une erreur s'est produite.</h2>
        <div class="retour">Retour à l'accueil</div>
    </div>
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

.container {
    max-width: 600px;
}

h1 {
    font-size: 40px;
    font-weight: 800;
    margin-bottom: 0px;

    @include media-breakpoint-up(lg) {
        font-size: 100px;
    }
}

h2 {
    font-size: 30px;
    margin-top: 10px;

    @include media-breakpoint-up(lg) {
        font-size: 60px;
    }
}

.retour {
    color: #fff;
    font-weight: 600;
    text-decoration: underline;
    font-size: 20px;
}
</style>