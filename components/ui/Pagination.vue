<template>
  <div class="pagination">
    <button class="left" @click="prevPage" :disabled="state.currentPage === 1">Prev</button>
    <span class="count">{{ state.currentPage }} / {{ totalPages }}</span>
    <button class="right" @click="nextPage" :disabled="state.currentPage === totalPages">Next</button>
  </div>
</template>

<script setup>
// import { toRef } from '@vueuse/core';

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

watch(() => props.currentPage, (val) => {
  console.log('currentPage', val);
  state.currentPage = val;
})
watch(() => props.totalPages, (val) => {
  console.log('totalPages', val);
  state.totalPages = val;
})

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