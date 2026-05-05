import { describe, expect, it } from 'vitest'
import { UI_THEMES } from './ui-themes'

const REQUIRED_TL_KEYS = [
	'tl-color-background',
	'tl-color-text',
	'tl-color-text-0',
	'tl-color-text-1',
	'tl-color-text-3',
	'tl-color-text-shadow',
	'tl-color-panel',
	'tl-color-panel-contrast',
	'tl-color-panel-overlay',
	'tl-color-panel-transparent',
	'tl-color-low',
	'tl-color-low-border',
	'tl-color-divider',
	'tl-color-selected',
	'tl-color-selected-contrast',
	'tl-color-primary',
	'tl-color-focus',
	'tl-color-muted-none',
	'tl-color-muted-0',
	'tl-color-muted-1',
	'tl-color-muted-2',
	'tl-color-hint',
	'tl-color-overlay',
	'tl-color-tooltip',
	'tl-color-success',
	'tl-color-info',
	'tl-color-warning',
	'tl-color-danger',
	'tl-color-grid',
	'tl-color-brush-fill',
	'tl-color-brush-stroke',
	'tl-color-selection-fill',
	'tl-color-selection-stroke',
	'tl-color-snap',
	'tl-color-laser',
]

const REQUIRED_TLA_KEYS = [
	'tla-color-sidebar',
	'tla-color-canvas',
	'tla-color-panel',
	'tla-color-text-1',
	'tla-color-text-2',
	'tla-color-text-3',
	'tla-color-contrast',
	'tla-color-low',
	'tla-color-border',
	'tla-color-hover-1',
	'tla-color-hover-2',
	'tla-color-hover-3',
	'tla-color-overlay',
	'tla-color-cta',
	'tla-color-cta-hover',
	'tla-color-inactive',
	'tla-color-inactive-hover',
	'tla-color-primary',
	'tla-color-primary-hover',
	'tla-color-secondary',
	'tla-color-secondary-hover',
	'tla-color-secondary-border',
	'tla-color-accent-1',
	'tla-color-accent-2',
	'tla-color-accent-3',
	'tla-color-warning',
	'tla-color-tooltip',
	'tla-color-drop-zone',
]

describe('UI_THEMES', () => {
	it('has unique ids', () => {
		const ids = UI_THEMES.map((t) => t.id)
		expect(ids).toEqual([...new Set(ids)])
	})

	it('includes the sunset theme', () => {
		const sunset = UI_THEMES.find((t) => t.id === 'sunset')
		expect(sunset).toBeDefined()
		expect(sunset!.name).toBe('Sunset')
	})

	for (const theme of UI_THEMES) {
		describe(theme.name, () => {
			it('has lightBackground and darkBackground set', () => {
				expect(theme.lightBackground).toMatch(/^#[0-9a-f]{6}$/i)
				expect(theme.darkBackground).toMatch(/^#[0-9a-f]{6}$/i)
			})

			for (const mode of ['light', 'dark'] as const) {
				describe(`${mode} variant`, () => {
					it('has all required tl CSS variables', () => {
						const tl = theme[mode].tl
						for (const key of REQUIRED_TL_KEYS) {
							expect(tl).toHaveProperty(key)
							expect(tl[key]).toBeTruthy()
						}
					})

					it('has all required tla CSS variables', () => {
						const tla = theme[mode].tla
						for (const key of REQUIRED_TLA_KEYS) {
							expect(tla).toHaveProperty(key)
							expect(tla[key]).toBeTruthy()
						}
					})
				})
			}

			it('produces a valid TLTheme via buildTLTheme', () => {
				expect(theme.theme).toBeDefined()
				expect(theme.theme.id).toBe(theme.id)
				expect(theme.theme.colors.light.background).toBeTruthy()
				expect(theme.theme.colors.dark.background).toBeTruthy()
			})
		})
	}
})
