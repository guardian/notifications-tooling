import type { Meta, StoryObj } from '@storybook/react-vite';
import { http, HttpResponse } from 'msw';
import { type ComponentProps, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { getApiBaseUrl } from '../api-client/config';
import { articleFixture } from '../testing/capi-fixtures';
import {
	channelAudiencesHandler,
	channelConstraintsHandler,
} from '../testing/handlers/channels';
import { htmlToSingleLineText } from '../utils/html-helpers';
import type {
	AppAlertFormValues,
	NewsletterFormValues,
} from '../utils/notification-forms';
import { ArticleImportControl } from './ArticleImportControl';
import {
	AppAlertNotificationFormProvider,
	NewsletterNotificationFormProvider,
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

type ArticleImportProps = Omit<
	ComponentProps<typeof ArticleImportControl>,
	'onArticleImported'
>;

const NewsletterArticleImport = (props: ArticleImportProps) => {
	const { setValue } = useFormContext<NewsletterFormValues>();
	return (
		<ArticleImportControl
			{...props}
			onArticleImported={(article) => {
				const { headline, standfirst } = article.fields ?? {};
				if (headline) {
					setValue('subject', headline);
				}
				const preview = htmlToSingleLineText(standfirst);
				if (preview) {
					setValue('preview', preview);
				}
			}}
		/>
	);
};

const AppAlertArticleImport = (props: ArticleImportProps) => {
	const { setValue } = useFormContext<AppAlertFormValues>();
	return (
		<ArticleImportControl
			{...props}
			onArticleImported={(article) =>
				setValue('headline', article.fields?.headline ?? article.webTitle)
			}
		/>
	);
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
		<>
			<button onClick={() => setChannel('newsletter')}>Newsletter</button>
			<button onClick={() => setChannel('app-alert')}>App alert</button>
			{channel === 'newsletter' ? (
				<NewsletterNotificationFormProvider>
					<NewsletterSubject />
					<NewsletterArticleImport
						articleInputText={newsletterArticleInputText}
						setArticleInputText={setNewsletterArticleInputText}
						lockArticleInputText={newsletterLockArticleInputText}
						setLockArticleInputText={setNewsletterLockArticleInputText}
					/>
				</NewsletterNotificationFormProvider>
			) : (
				<AppAlertNotificationFormProvider>
					<AppAlertHeadline />
					<AppAlertArticleImport
						articleInputText={appAlertArticleInputText}
						setArticleInputText={setAppAlertArticleInputText}
						lockArticleInputText={appAlertLockArticleInputText}
						setLockArticleInputText={setAppAlertLockArticleInputText}
					/>
				</AppAlertNotificationFormProvider>
			)}
		</>
	);
};

const meta = {
	title: 'Stand Frontend/NotificationFormProvider',
	component: ProviderHarness,
	parameters: {
		msw: {
			handlers: [
				resolveArticleHandler,
				channelConstraintsHandler,
				channelAudiencesHandler,
			],
		},
	},
} satisfies Meta<typeof ProviderHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ArticleStateIsOwnedByChannel: Story = {
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
		await expect(
			canvas.getByLabelText('Newsletter subject'),
		).toBeEmptyDOMElement();
	},
};
