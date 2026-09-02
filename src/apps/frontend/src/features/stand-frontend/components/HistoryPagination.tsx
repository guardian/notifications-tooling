import { css } from '@emotion/react';
import { baseColors, semanticColors, semanticSpacing } from '@guardian/stand';
import {
	type PaginationTheme,
	Pagination as StandPagination,
} from '@guardian/stand/Pagination';
import { from } from '@guardian/stand/utils';
import { useState } from 'react';

const PAGE_SIZE = 10;

const styles = {
	wrapper: css({
		width: '100%',
		minWidth: 0,
		display: 'flex',
		paddingTop: semanticSpacing.stackXs,
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
	onPageChange: (page: number) => void;
}

export const useHistoryPagination = <T,>(items: T[]) => {
	const [currentPage, setCurrentPage] = useState(1);
	const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
	const activePage = Math.min(currentPage, totalPages);
	const pageStart = (activePage - 1) * PAGE_SIZE;

	const handlePageChange = (page: number) => {
		setCurrentPage(Math.min(page, totalPages));
	};

	return {
		activePage,
		handlePageChange,
		pageSize: PAGE_SIZE,
		shouldShowPagination: items.length > PAGE_SIZE,
		visibleItems: items.slice(pageStart, pageStart + PAGE_SIZE),
	};
};

export const HistoryPagination = ({
	currentPage,
	totalItems,
	onPageChange,
}: HistoryPaginationProps) => {
	return (
		<div css={styles.wrapper}>
			<StandPagination
				currentPage={currentPage}
				totalItems={totalItems}
				pageSize={PAGE_SIZE}
				onPageChange={onPageChange}
				theme={paginationTheme}
				cssOverrides={styles.pagination}
				collapseBelow="md"
			/>
		</div>
	);
};
