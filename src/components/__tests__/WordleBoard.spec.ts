import { mount } from '@vue/test-utils'
import WordleBoard from '../WordleBoard.vue'
import { DEFEAT_MESSAGE, MAX_GUESSES_COUNT, VICTORY_MESSAGE, WORD_SIZE } from '../../settings'
import { expect } from 'vitest'
import GuessView from '../GuessView.vue'

describe('WordleBoard', () => {
  const wordOfTheDay = 'TESTS'
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(WordleBoard, { props: { wordOfTheDay } })
  })

  async function playerTypesGuess(guess: string) {
    wrapper.find('input[type="text"]').setValue(guess)
  }

  async function playerPressesEnter() {
    wrapper.find('input[type="text"]').trigger('keydown.enter')
  }

  async function playerTypesAndSubmitsGuess(guess: string) {
    await playerTypesGuess(guess)
    await playerPressesEnter()
  }

  describe('End of the game messages', () => {
    test('a victory message appears when the user makes a guess that matches the word of the day', async () => {
      //Act
      await playerTypesAndSubmitsGuess(wordOfTheDay)

      //Assert
      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })

    describe.each([
      { numberOfGuesses: 0, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 1, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 2, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 3, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 4, shouldSeeDefeatMessage: false },
      { numberOfGuesses: 5, shouldSeeDefeatMessage: false },
      { numberOfGuesses: MAX_GUESSES_COUNT, shouldSeeDefeatMessage: true }
    ])(
      `a defeat message appears if the player makes ${MAX_GUESSES_COUNT} incorrect guesses in a row`,
      ({ numberOfGuesses, shouldSeeDefeatMessage }) => {
        test(`therefore for ${numberOfGuesses} guess(es), a defeat message should ${shouldSeeDefeatMessage ? '' : 'not'} appear`, async () => {
          for (let i = 0; i < numberOfGuesses; i++) {
            await playerTypesAndSubmitsGuess('WRONG')
          }

          if (shouldSeeDefeatMessage) {
            expect(wrapper.text()).toContain(DEFEAT_MESSAGE)
          } else {
            expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
          }
        })
      }
    )

    test('no end-of-game message appears if the user has not yet made a guess', async () => {
      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
      expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
    })
  })

  describe('Rules for defining the word of the day', () => {
    beforeEach(() => {
      console.warn = vi.fn()
    })

    test.each([
      { wordOfTheDay: 'FLY', reason: 'word-of-the-day must have 5 characters' },
      { wordOfTheDay: 'tests', reason: 'word-of-the-day must be all in uppercase' },
      { wordOfTheDay: 'QWERT', reason: 'word-of-the-day must be a valid English word' }
    ])(
      'Since $reason: $wordOfTheDay is invalid, therefore a warning must be emitted',
      async ({ wordOfTheDay }) => {
        mount(WordleBoard, { props: { wordOfTheDay } })

        expect(console.warn).toHaveBeenCalled()
      }
    )

    test('no warning is emitted if the word of the day is valid', async () => {
      mount(WordleBoard, { props: { wordOfTheDay: 'TESTS' } })

      expect(console.warn).not.toHaveBeenCalled()
    })
  })

  describe('Player input', () => {
    test('remains in focus the entire time', async () => {
      document.body.innerHTML = `<div id="app"></div>`
      wrapper = mount(WordleBoard, { props: { wordOfTheDay }, attachTo: '#app' })

      expect(wrapper.find("input[type='text']").attributes('autofocus')).not.toBeUndefined()

      await wrapper.find("input[type='text']").trigger('blur')
      expect(document.activeElement).toBe(wrapper.find("input[type='text']").element)
    })

    test('the input gets cleared after each submission', async () => {
      await playerTypesAndSubmitsGuess('WRONG')

      expect(wrapper.find<HTMLInputElement>('input[type="text"]').element.value).toEqual('')
    })

    test(`player guesses are limited to ${WORD_SIZE} letters`, async () => {
      await playerTypesAndSubmitsGuess(wordOfTheDay + 'EXTRA')

      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })

    test('player guesses can only be submitted if they are real words', async () => {
      await playerTypesAndSubmitsGuess('QWERT')

      expect(wrapper.text()).not.toContain(VICTORY_MESSAGE)
      expect(wrapper.text()).not.toContain(DEFEAT_MESSAGE)
    })

    test('player guesses are not case-sensitive', async () => {
      await playerTypesAndSubmitsGuess(wordOfTheDay.toLowerCase())

      expect(wrapper.text()).toContain(VICTORY_MESSAGE)
    })

    test('player guesses can only contain letters', async () => {
      await playerTypesGuess('H3!RT')

      expect(wrapper.find<HTMLInputElement>('input[type="text"]').element.value).toEqual('HRT')
    })

    test.skip('non-letters characters do not render on the screen while being typed', async () => {
      await playerTypesGuess('12')
      await playerTypesGuess('123')

      expect(wrapper.find<HTMLInputElement>('input[type="text"]').element.value).toEqual('')
    })

    test('player loses control after the max amount of guesses have been sent', async () => {
      for (let i = 0; i < MAX_GUESSES_COUNT; i++) {
        await playerTypesAndSubmitsGuess('WRONG')
      }

      expect(
        wrapper.find<HTMLInputElement>('input[type="text"]').attributes('disabled')
      ).not.toBeUndefined()
    })

    test('player loses control after the correct guess has been given', async () => {
      await playerTypesAndSubmitsGuess(wordOfTheDay)

      expect(
        wrapper.find<HTMLInputElement>('input[type="text"]').attributes('disabled')
      ).not.toBeUndefined()
    })
  })

  test('All previous guesses submitted by the player are visible in the page', async () => {
    const guesses = ['WRONG', 'GUESS', 'HELLO', 'WORLD', 'HAPPY', 'CODER']

    for (const guess of guesses) {
      await playerTypesAndSubmitsGuess(guess)
    }

    for (const guess of guesses) {
      expect(wrapper.text()).toContain(guess)
    }
  })

  describe(`there should always be exactly ${MAX_GUESSES_COUNT} guess-view in the board`, () => {
    test(`${MAX_GUESSES_COUNT} guess-views are present at the start of the game`, async () => {
      expect(wrapper.findAllComponents(GuessView)).toHaveLength(MAX_GUESSES_COUNT)
    })

    test(`${MAX_GUESSES_COUNT} guess-views are present when the player wins the game`, async () => {
      await playerTypesAndSubmitsGuess(wordOfTheDay)

      expect(wrapper.findAllComponents(GuessView)).toHaveLength(MAX_GUESSES_COUNT)
    })

    test(`${MAX_GUESSES_COUNT} guess-views are present when the player loses the game`, async () => {
      const guesses = ['WRONG', 'GUESS', 'HELLO', 'WORLD', 'HAPPY', 'CODER']

      for (const guess of guesses) {
        await playerTypesAndSubmitsGuess(guess)
      }

      expect(wrapper.findAllComponents(GuessView)).toHaveLength(MAX_GUESSES_COUNT)
    })
  })
})
