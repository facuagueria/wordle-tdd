<script setup lang="ts">
import { WORD_SIZE } from '@/settings'
import { computed, ref } from 'vue'
import englishWords from '@/englishWordsWith5Letters.json'
import GuessView from '@/components/GuessView.vue'

const emit = defineEmits<{
  (e: 'guess-submitted', guess: string): void
}>()

const wordInProgress = ref<string | null>(null)

const formattedGuessInProgress = computed<string>({
  get: () => wordInProgress.value ?? '',
  set: (rawValue: string) => {
    wordInProgress.value = null

    wordInProgress.value = rawValue
      .slice(0, WORD_SIZE)
      .toUpperCase()
      .replace(/[^A-Z]+/gi, '')
  }
})

const onSubmit = () => {
  if (!englishWords.includes(formattedGuessInProgress.value)) return

  emit('guess-submitted', formattedGuessInProgress.value)
  wordInProgress.value = null
}

const isLetter = (event: KeyboardEvent) => {
  if (event.key.length !== 1) return

  const isLetter = event.key.match(/[A-z]/i)
  if (!isLetter) event.preventDefault()
}
</script>

<template>
  <GuessView :guess="formattedGuessInProgress" />

  <input
    v-model="formattedGuessInProgress"
    :maxlength="WORD_SIZE"
    autofocus
    @blur="({ target }) => (target as HTMLInputElement).focus()"
    type="text"
    @keydown.enter="onSubmit"
    @keydown="isLetter($event)"
  />
</template>

<style scoped>
input {
  position: absolute;
  opacity: 0;
}
</style>
