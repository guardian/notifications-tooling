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
