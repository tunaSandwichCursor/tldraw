import { describe, expect, it } from 'vitest'
import { UI_THEMES } from './ui-themes'

const referenceId = 'solarized'

describe('UI themes', () => {
	it('includes the sunset theme', () => {
		const sunset = UI_THEMES.find((t) => t.id === 'sunset')
		expect(sunset).toBeDefined()
		expect(sunset?.name).toBe('Sunset')
	})

	it('every theme defines lightBackground and darkBackground', () => {
		for (const theme of UI_THEMES) {
			expect(theme.lightBackground, `${theme.id} lightBackground`).toMatch(/^#|^hsl/i)
			expect(theme.darkBackground, `${theme.id} darkBackground`).toMatch(/^#|^hsl/i)
		}
	})

	it('every theme provides the same set of tl and tla CSS variables in both light and dark', () => {
		const reference = UI_THEMES.find((t) => t.id === referenceId)!
		const expectedTl = Object.keys(reference.light.tl).sort()
		const expectedTla = Object.keys(reference.light.tla).sort()

		for (const theme of UI_THEMES) {
			for (const mode of ['light', 'dark'] as const) {
				expect(Object.keys(theme[mode].tl).sort(), `${theme.id} ${mode} tl keys`).toEqual(
					expectedTl
				)
				expect(Object.keys(theme[mode].tla).sort(), `${theme.id} ${mode} tla keys`).toEqual(
					expectedTla
				)

				for (const key of expectedTl) {
					expect(theme[mode].tl[key], `${theme.id} ${mode} tl.${key}`).toBeTruthy()
				}
				for (const key of expectedTla) {
					expect(theme[mode].tla[key], `${theme.id} ${mode} tla.${key}`).toBeTruthy()
				}
			}
		}
	})
})
