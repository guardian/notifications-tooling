import { semanticColors } from '@guardian/stand';

/**
 * Guardian editorial pillar accent colours, keyed by CAPI's `pillarId`.
 * Matches the palette used by other Guardian editorial tools (e.g.
 * facia-tool's getPillarColor and capi.gutools's pillarColor) so pillar
 * colouring is consistent across tooling.
 */
const PILLAR_COLORS: Record<string, string> = {
	'pillar/news': '#C70000',
	'pillar/opinion': '#E05E00',
	'pillar/sport': '#0084C6',
	'pillar/lifestyle': '#BB3B80',
	'pillar/arts': '#A1845C',
};

/** Fallback colour for content with no recognised pillar. */
const DEFAULT_PILLAR_COLOR = semanticColors.text.strong;

export const getPillarColor = (pillarId?: string): string =>
	(pillarId ? PILLAR_COLORS[pillarId] : undefined) ?? DEFAULT_PILLAR_COLOR;

const PILLAR_BACKGROUND_COLORS: Record<string, string> = {
	'pillar/news': '#BB0000',
	'pillar/opinion': '#C74600',
	'pillar/sport': '#0079BB',
	'pillar/lifestyle': '#BB3B80',
	'pillar/arts': '#866D50',
};
/** Fallback colour for content with no recognised pillar. */
const DEFAULT_PILLAR_BACKGROUND_COLOR = '#BB0000';

export const getPillarBackgroundColor = (pillarId?: string): string =>
	(pillarId ? PILLAR_BACKGROUND_COLORS[pillarId] : undefined) ??
	DEFAULT_PILLAR_BACKGROUND_COLOR;
