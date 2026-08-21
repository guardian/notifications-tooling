import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { getApiBaseUrl } from '../../api/config';
import { articleFixture } from '../../mocks/capi-fixtures';
import { ArticleImportControl } from './components/ArticleImportControl';
import type {
	AppAlertFormValues,
	NewsletterFormValues,
} from './notification-forms';
import {
	AppAlertNotificationFormProvider,
	NewsletterNotificationFormProvider,
	NotificationDraftsProvider,
} from './NotificationFormProvider';

const resolveArticleHandler = http.post(
	`${getApiBaseUrl()}/v1/content/articles/resolve`,
	() => HttpResponse.json({ article: articleFixture }),
);

const NewsletterSubject = () => {
	const subject = useWatch<NewsletterFormValues, 'subject'>({
		name: 'subject',
	});
	return <output aria-label="Newsletter subject">{subject}</output>;
};

const AppAlertHeadline = () => {
	const headline = useWatch<AppAlertFormValues, 'headline'>({
		name: 'headline',
	});
	return <output aria-label="App alert headline">{headline}</output>;
};

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
					<NewsletterSubject />
					<ArticleImportControl
						articleInputText={newsletterArticleInputText}
						setArticleInputText={setNewsletterArticleInputText}
						lockArticleInputText={newsletterLockArticleInputText}
						setLockArticleInputText={setNewsletterLockArticleInputText}
					/>
				</NewsletterNotificationFormProvider>
			) : (
				<AppAlertNotificationFormProvider>
					<AppAlertHeadline />
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
		await expect(canvas.getByLabelText('Newsletter subject')).toHaveTextContent(
			articleFixture.fields?.headline ?? '',
		);

		await userEvent.click(canvas.getByRole('button', { name: 'App alert' }));
		await expect(canvas.getByLabelText('article URL')).toHaveValue('');
		await expect(
			canvas.getByLabelText('App alert headline'),
		).toBeEmptyDOMElement();

		await userEvent.click(canvas.getByRole('button', { name: 'Newsletter' }));
		await expect(canvas.getByLabelText('article URL')).toHaveValue(
			articleFixture.webUrl,
		);
		await expect(canvas.getByLabelText('Newsletter subject')).toHaveTextContent(
			articleFixture.fields?.headline ?? '',
		);
	},
};
