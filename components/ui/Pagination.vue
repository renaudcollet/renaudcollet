<template>
  <div class="pagination">
    <button class="left" @click="prevPage" :disabled="currentPage === 1">Prev</button>
    <span class="count">{{ currentPage }} / {{ totalPages }}</span>
    <button class="right" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
  </div>
</template>

<script setup>
import { toRef } from '@vueuse/core';

const emit = defineEmits(['onPageUpdate'])

const props = defineProps({
  currentPage: Number,
  totalPages: Number,
});

const state = reactive({
  currentPage: props.currentPage,
  totalPages: props.totalPages,
})

const currentPage = toRef(state, 'currentPage')
const totalPages = toRef(state, 'totalPages')

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    emit('onPageUpdate', currentPage.value);
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    emit('onPageUpdate', currentPage.value)
  }
}
</script>