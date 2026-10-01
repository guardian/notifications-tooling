import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { expect, userEvent, within } from 'storybook/test';
import { getApiBaseUrl } from '../api-client/config';
import type { NotificationListResponse, NotificationSummary } from '../schemas';
import {
	appPushSendBeyondBradford,
	newsletterSendBeyondBradford,
} from '../testing/api-fixtures';
import { PreviousNotificationsBar } from './PreviousNotificationsBar';

const articleId = 'global/2016/march/01/some-article';

const respondWith = (sends: NotificationSummary[]) =>
	http.get(`${getApiBaseUrl()}/v1/notifications`, ({ request }) => {
		if (new URL(request.url).searchParams.get('articleId') !== articleId) {
			return;
		}

		const response: NotificationListResponse = {
			total: sends.length,
			offset: 0,
			limit: 5,
			notifications: sends,
		};
		return HttpResponse.json(response);
	});

const meta = {
	title: 'Dispatch/Compose/PreviousNotificationsBar',
	component: PreviousNotificationsBar,
	args: {
		articleId,
		showImportedArticle: true,
	},
	decorators: [
		(Story) => {
			return (
				<section css={{ maxWidth: 500, paddingLeft: '1rem' }}>
					<Story />
				</section>
			);
		},
	],
} satisfies Meta<typeof PreviousNotificationsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnePreviousAppSend: Story = {
	args: {},
	parameters: {
		msw: { handlers: [respondWith([appPushSendBeyondBradford])] },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(canvasElement.ownerDocument.body);

		await expect(
			await canvas.findByText('Sent an App alert with this URL'),
		).toBeVisible();

		await userEvent.click(canvas.getByRole('button', { name: 'Ann Nonymous' }));
		await expect(await page.findByRole('tooltip')).toHaveTextContent(
			'Ann Nonymous',
		);
		await userEvent.keyboard('{Escape}');

		await userEvent.click(canvas.getByRole('button', { name: 'send details' }));
		const details = await page.findByRole('tooltip');
		await expect(details).toHaveTextContent('21 Sept 2026, 09:41 UK');
		await expect(details).not.toHaveTextContent('Ann Nonymous');
		await expect(details).not.toHaveTextContent('App alert');
		for (const audience of ['United States', 'International', 'Europe']) {
			await expect(
				within(details).getByRole('img', { name: audience }),
			).toBeVisible();
		}
	},
};

export const OnePreviousNewsletterSend: Story = {
	args: {},
	parameters: {
		msw: { handlers: [respondWith([newsletterSendBeyondBradford])] },
	},
	play: async ({ canvasElement }) => {
		await expect(
			await within(canvasElement).findByText(
				'Sent a Newsletter email with this URL',
			),
		).toBeVisible();
	},
};

export const TwoPreviousSends: Story = {
	args: {},
	parameters: {
		msw: {
			handlers: [
				respondWith([appPushSendBeyondBradford, newsletterSendBeyondBradford]),
			],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const page = within(canvasElement.ownerDocument.body);

		await expect(
			await canvas.findByText('Sent an alert with this URL'),
		).toBeVisible();
		await userEvent.click(canvas.getByRole('button', { name: 'senders' }));
		const sendersTooltip = await page.findByRole('tooltip');
		const senderNames = within(sendersTooltip).getAllByRole('listitem');
		await expect(senderNames).toHaveLength(2);
		await expect(senderNames[0]).toHaveTextContent('Ann Nonymous');
		await expect(senderNames[1]).toHaveTextContent('John Doe');
		await userEvent.keyboard('{Escape}');

		await userEvent.click(canvas.getByRole('button', { name: 'send details' }));

		const tooltip = await page.findByRole('tooltip');
		await expect(tooltip).toHaveTextContent(
			'Ann Nonymous, App alert, 21 Sept 2026, 09:41 UK',
		);
		await expect(tooltip).toHaveTextContent(
			'John Doe, Newsletter email, 18 Sept 2026, 11:23 UK',
		);
		for (const audience of [
			'United States',
			'International',
			'Europe',
			'United Kingdom',
		]) {
			await expect(
				within(tooltip).getByRole('img', { name: audience }),
			).toBeVisible();
		}
	},
};

export const FourPreviousSends: Story = {
	args: {},
	parameters: {
		msw: {
			handlers: [
				respondWith([
					newsletterSendBeyondBradford,
					appPushSendBeyondBradford,
					{ ...newsletterSendBeyondBradford, id: 'newsletter-send-2' },
					{ ...appPushSendBeyondBradford, id: 'app-push-send-2' },
				]),
			],
		},
	},
};
export const FivePreviousSends: Story = {
	args: {},
	parameters: {
		msw: {
			handlers: [
				respondWith([
					appPushSendBeyondBradford,
					newsletterSendBeyondBradford,
					{ ...appPushSendBeyondBradford, id: 'app-push-send-2' },
					{ ...newsletterSendBeyondBradford, id: 'newsletter-send-2' },
					{ ...appPushSendBeyondBradford, id: 'app-push-send-3' },
				]),
			],
		},
	},
};
