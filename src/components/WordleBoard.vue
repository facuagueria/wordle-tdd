<script setup lang="ts">
import { DEFEAT_MESSAGE, VICTORY_MESSAGE } from '@/settings'
import { ref } from 'vue'

defineProps({
  wordOfTheDay: {
    type: String,
    validator: (value: string) => value.length === 5
  }
})

const wordInProgress = ref('')
const wordSubmitted = ref('')
</script>

<template>
  <input v-model="wordInProgress" type="text" @keydown.enter="wordSubmitted = wordInProgress" />
  <p
    v-if="wordSubmitted.length > 0"
    v-text="wordSubmitted === wordOfTheDay ? VICTORY_MESSAGE : DEFEAT_MESSAGE"
  />
</template>
