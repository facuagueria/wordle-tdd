<script setup lang="ts">
import { DEFEAT_MESSAGE, VICTORY_MESSAGE } from '@/settings'
import { ref } from 'vue'
import englishWords from '@/englishWordsWith5Letters.json'
import GuessInput from '@/components/GuessInput.vue'

defineProps({
  wordOfTheDay: {
    type: String,
    validator: (value: string) => englishWords.includes(value)
  }
})

const wordSubmitted = ref('')
</script>

<template>
  <guess-input @guess-submitted="(guess: string) => (wordSubmitted = guess)" />
  <p
    v-if="wordSubmitted.length > 0"
    v-text="wordSubmitted === wordOfTheDay ? VICTORY_MESSAGE : DEFEAT_MESSAGE"
  />
</template>
