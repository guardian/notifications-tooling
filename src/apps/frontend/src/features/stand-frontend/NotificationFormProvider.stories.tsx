import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { getApiBaseUrl } from '../../api/config';
import { articleFixture } from '../../mocks/capi-fixtures';
import { ArticleImportControl } from './components/ArticleImportControl';
import {
	AppAlertNotificationFormProvider,
	NewsletterNotificationFormProvider,
	NotificationDraftsProvider,
} from './NotificationFormProvider';

const resolveArticleHandler = http.post(
	`${getApiBaseUrl()}/v1/content/articles/resolve`,
	() => HttpResponse.json({ article: articleFixture }),
);

const ProviderHarness = () => {
	const [channel, setChannel] = useState<'newsletter' | 'app-alert'>(
		'newsletter',
	);
	const [newsletterArticleInputText, setNewsletterArticleInputText] =
		useState('');
	const [newsletterLockArticleInputText, setNewsletterLockArticleInputText] =
		useState(false);
	const [appAlertArticleInputText, setAppAlertArticleInputText] = useState('');
	const [appAlertLockArticleInputText, setAppAlertLockArticleInputText] =
		useState(false);
	return (
		<NotificationDraftsProvider>
			<button onClick={() => setChannel('newsletter')}>Newsletter</button>
			<button onClick={() => setChannel('app-alert')}>App alert</button>
			{channel === 'newsletter' ? (
				<NewsletterNotificationFormProvider>
					<ArticleImportControl
						articleInputText={newsletterArticleInputText}
						setArticleInputText={setNewsletterArticleInputText}
						lockArticleInputText={newsletterLockArticleInputText}
						setLockArticleInputText={setNewsletterLockArticleInputText}
					/>
				</NewsletterNotificationFormProvider>
			) : (
				<AppAlertNotificationFormProvider>
					<ArticleImportControl
						articleInputText={appAlertArticleInputText}
						setArticleInputText={setAppAlertArticleInputText}
						lockArticleInputText={appAlertLockArticleInputText}
						setLockArticleInputText={setAppAlertLockArticleInputText}
					/>
				</AppAlertNotificationFormProvider>
			)}
		</NotificationDraftsProvider>
	);
};

const meta = {
	title: 'Stand Frontend/NotificationFormProvider',
	component: ProviderHarness,
	parameters: {
		msw: { handlers: [resolveArticleHandler] },
	},
} satisfies Meta<typeof ProviderHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ArticleStateIsSeparateByTab: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const articleInput = canvas.getByLabelText('article URL');

		await userEvent.type(articleInput, articleFixture.webUrl);
		await userEvent.click(canvas.getByRole('button', { name: 'Fetch' }));
		await waitFor(() =>
			expect(canvas.getByText('Article imported')).toBeVisible(),
		);

		await userEvent.click(canvas.getByRole('button', { name: 'App alert' }));
		await expect(canvas.getByLabelText('article URL')).toHaveValue('');

		await userEvent.click(canvas.getByRole('button', { name: 'Newsletter' }));
		await expect(canvas.getByLabelText('article URL')).toHaveValue(
			articleFixture.webUrl,
		);
	},
};
