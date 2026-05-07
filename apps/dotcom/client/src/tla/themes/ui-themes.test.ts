import { describe, expect, it } from 'vitest'
import { UI_THEMES } from './ui-themes'
import type { UIThemeVariant } from './ui-themes'

describe('UI_THEMES', () => {
	it('includes the Sunset theme with light and dark backgrounds', () => {
		const sunset = UI_THEMES.find((theme) => theme.id === 'sunset')

		expect(sunset).toMatchObject({
			id: 'sunset',
			name: 'Sunset',
			lightBackground: '#fff1e8',
			darkBackground: '#24111f',
		})
		expect(sunset?.theme.id).toBe('sunset')
		expect(sunset?.theme.colors.light.background).toBe('#fff1e8')
		expect(sunset?.theme.colors.dark.background).toBe('#24111f')
	})

	it('defines the same CSS variables for every theme variant', () => {
		const reference = UI_THEMES[0]!
		const sections: Array<[string, (variant: UIThemeVariant) => Record<string, string>]> = [
			['light.tl', (variant) => variant.tl],
			['light.tla', (variant) => variant.tla],
			['dark.tl', (variant) => variant.tl],
			['dark.tla', (variant) => variant.tla],
		]

		for (const [label, getVariables] of sections) {
			const expectedKeys = Object.keys(
				getVariables(label.startsWith('light') ? reference.light : reference.dark)
			).sort()

			for (const theme of UI_THEMES) {
				const variant = label.startsWith('light') ? theme.light : theme.dark
				expect(Object.keys(getVariables(variant)).sort(), `${theme.id} ${label}`).toEqual(
					expectedKeys
				)
			}
		}
	})
})
