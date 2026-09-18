import { css } from '@emotion/react';
import {
	Table,
	TableBody,
	TableColumnHeader,
	TableHeader,
} from '@guardian/stand/Table';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { latestPublishedContentTheme } from '../themes';
import { mockLatestPublishedContent } from './latest-published-content';
import { LatestPublishedContentCard } from './LatestPublishedContentCard';

const tableColumns = { sm: 'minmax(0, 1fr)' } as const;
const hiddenHeader = css({ display: 'none' });

const CardStory = ({
	args,
	width,
}: {
	args: Parameters<typeof LatestPublishedContentCard>[0];
	width: string;
}) => (
	<div style={{ width, minWidth: width, flexShrink: 0 }}>
		<Table
			aria-label="Latest published content card"
			columns={tableColumns}
			cssOverrides={latestPublishedContentTheme.list}
		>
			<TableHeader cssOverrides={hiddenHeader}>
				<TableColumnHeader isRowHeader aria-label="Content" />
			</TableHeader>
			<TableBody>
				<LatestPublishedContentCard {...args} />
			</TableBody>
		</Table>
	</div>
);

const meta = {
	title: 'Stand Frontend/DispatchLanding/LatestPublishedContentCard',
	component: LatestPublishedContentCard,
	args: {
		content: mockLatestPublishedContent[0],
	},
	parameters: {
		layout: 'centered',
	},
	render: (args) => <CardStory args={args} width="612px" />,
} satisfies Meta<typeof LatestPublishedContentCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText(args.content.section)).toBeVisible();
		await expect(
			canvas.getByText(`/ ${args.content.pillarName}`),
		).toBeVisible();
		const publishedTime = canvasElement.querySelector('time');
		await expect(publishedTime).toBeVisible();
		await expect(publishedTime).toHaveAttribute('datetime');
		await expect(
			canvas.getByRole('link', { name: new RegExp(args.content.headline) }),
		).toBeVisible();
		const createButton = canvas.getByRole('button', { name: /create/i });
		await expect(createButton).toBeVisible();
		await expect(getComputedStyle(createButton).backgroundColor).toBe(
			'rgb(255, 255, 255)',
		);
		await userEvent.hover(createButton);
		await waitFor(async () => {
			await expect(getComputedStyle(createButton).backgroundColor).toBe(
				'rgb(246, 246, 246)',
			);
		});
	},
};

export const Compact: Story = {
	render: (args) => <CardStory args={args} width="380px" />,
};

export const NoImage: Story = {
	args: {
		content: { ...mockLatestPublishedContent[0]!, imageUrl: undefined },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('No image')).toBeVisible();
	},
};
