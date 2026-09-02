import { css } from '@emotion/react';
import { baseColors, semanticColors } from '@guardian/stand';
import {
	type PaginationTheme,
	Pagination as StandPagination,
} from '@guardian/stand/Pagination';
import { from } from '@guardian/stand/utils';

const styles = {
	wrapper: css({
		width: '100%',
		minWidth: 0,
		display: 'flex',
		[from.md]: {
			paddingTop: 0,
			marginLeft: 'auto',
			width: 'auto',
		},
	}),
	pagination: css({
		width: '100%',
		maxWidth: '100%',
		justifyContent: 'space-between',
		'& ul button[data-hovered], & ul button:hover': {
			color: semanticColors.text.strongerInverse,
		},
		'& > button': {
			color: semanticColors.text.strong,
			background: semanticColors.bg.base,
			border: `1px solid ${semanticColors.border.weak}`,
			'&[data-hovered], &:hover': {
				color: semanticColors.text.strongerInverse,
				background: baseColors.magenta[200],
				border: `1px solid ${baseColors.magenta[200]}`,
			},
			'&[data-pressed], &:active': {
				color: semanticColors.text.strongerInverse,
				background: baseColors.magenta[200],
				border: `1px solid ${baseColors.magenta[200]}`,
			},
			'&[data-disabled], &:disabled': {
				color: semanticColors.text.disabled,
				background: semanticColors.fill.disabled,
				border: `1px solid ${semanticColors.fill.disabled}`,
			},
		},
		[from.md]: {
			width: 'auto',
			justifyContent: 'flex-end',
		},
	}),
};

const paginationTheme: PaginationTheme = {
	item: {
		current: {
			backgroundColor: baseColors.magenta[200],
			borderColor: baseColors.magenta[200],
			color: semanticColors.text.strongerInverse,
		},
		hover: {
			backgroundColor: baseColors.magenta[200],
			borderColor: baseColors.magenta[200],
		},
		active: {
			backgroundColor: baseColors.magenta[200],
		},
		focusVisible: {
			outlineColor: baseColors.magenta[700],
		},
	},
};

interface HistoryPaginationProps {
	currentPage: number;
	totalItems: number;
	limit: number;
	onPageChange: (page: number) => void;
}

export const HistoryPagination = ({
	currentPage,
	totalItems,
	limit,
	onPageChange,
}: HistoryPaginationProps) => {
	return (
		<div css={styles.wrapper}>
			<StandPagination
				currentPage={currentPage}
				totalItems={totalItems}
				pageSize={limit}
				onPageChange={onPageChange}
				theme={paginationTheme}
				cssOverrides={styles.pagination}
				collapseBelow="md"
			/>
		</div>
	);
};
