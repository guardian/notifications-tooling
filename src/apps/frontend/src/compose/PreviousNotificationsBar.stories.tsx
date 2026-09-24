import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { getApiBaseUrl } from '../api-client/config';
import type { NotificationListResponse, NotificationSummary } from '../schemas';
import {
	appPushSendBeyondBradford,
	newsletterSendBeyondBradford,
} from '../testing/api-fixtures';
import { PreviousNotificationsBar } from './PreviousNotificationsBar';

const articleId = 'global/2016/march/01/some-article';

const respondWith = (sends: NotificationSummary[]) =>
	http.get(`${getApiBaseUrl()}/v1/notifications?articleId=${articleId}`, () => {
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
} satisfies Meta<typeof PreviousNotificationsBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnePreviousAppSend: Story = {
	args: {},
	parameters: {
		msw: [respondWith([appPushSendBeyondBradford])],
	},
};

export const OnePreviousNewsletterSend: Story = {
	args: {},
	parameters: {
		msw: [respondWith([newsletterSendBeyondBradford])],
	},
};

export const TwoPreviousSends: Story = {
	args: {},
	parameters: {
		msw: [
			respondWith([appPushSendBeyondBradford, newsletterSendBeyondBradford]),
		],
	},
};

export const FivePreviousSends: Story = {
	args: {},
	parameters: {
		msw: [
			respondWith([
				appPushSendBeyondBradford,
				newsletterSendBeyondBradford,
				appPushSendBeyondBradford,
				newsletterSendBeyondBradford,
				appPushSendBeyondBradford,
			]),
		],
	},
};
