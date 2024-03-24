<script setup lang="ts">
import { DEFEAT_MESSAGE, VICTORY_MESSAGE, WORD_SIZE } from '@/settings'
import { computed, ref } from 'vue'
import englishWords from '@/englishWordsWith5Letters.json'

defineProps({
  wordOfTheDay: {
    type: String,
    validator: (value: string) => englishWords.includes(value)
  }
})

const wordInProgress = ref('')
const wordSubmitted = ref('')

const formattedGuessInProgress = computed({
  get: () => wordInProgress.value,
  set: (rawValue: string) => {
    wordInProgress.value = rawValue.slice(0, WORD_SIZE).toUpperCase()
  }
})

const onSubmit = () => {
  if (!englishWords.includes(wordInProgress.value)) return

  wordSubmitted.value = wordInProgress.value
  wordInProgress.value = ''
}
</script>

<template>
  <input
    v-model="formattedGuessInProgress"
    :maxlength="WORD_SIZE"
    type="text"
    @keydown.enter="onSubmit"
  />
  <p
    v-if="wordSubmitted.length > 0"
    v-text="wordSubmitted === wordOfTheDay ? VICTORY_MESSAGE : DEFEAT_MESSAGE"
  />
</template>
