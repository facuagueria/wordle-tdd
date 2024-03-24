<script setup lang="ts">
import { WORD_SIZE } from '@/settings'
import { computed, ref } from 'vue'
import englishWords from '@/englishWordsWith5Letters.json'

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
  wordInProgress.value = ''
}

const isLetter = (event: KeyboardEvent) => {
  if (event.key.length !== 1) return

  const isLetter = event.key.match(/[A-z]/i)
  if (!isLetter) event.preventDefault()
}
</script>

<template>
  <ul class="word">
    <li
      v-for="(letter, index) in formattedGuessInProgress.padEnd(WORD_SIZE, ' ')"
      :key="`${letter}-${index}`"
      :data-letter="letter"
      class="letter"
      v-text="letter"
    />
  </ul>

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

.word {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 0.25rem;
}

.letter {
  background-color: white;
  border: 1px solid hsl(0, 0%, 70%);
  width: 5rem;
  height: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  font-weight: bolder;
}

li:not([data-letter=' ']) {
  animation: pop 100ms;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.4);
  }
}
</style>