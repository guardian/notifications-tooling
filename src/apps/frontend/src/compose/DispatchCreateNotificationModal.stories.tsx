import type { AppConfig } from '@models';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { ConfigContext } from '../config/ConfigContext';
import { mockLatestPublishedContent } from '../latest-content/latest-published-content';
import { withArticleUrl } from '../routes';
import { mockAppConfig } from '../testing/app-config';
import { DispatchCreateNotificationModal } from './DispatchCreateNotificationModal';

type StoryArgs = ComponentProps<typeof DispatchCreateNotificationModal> & {
	appConfig: AppConfig;
};

const selectedArticle = mockLatestPublishedContent[0]!;
const selectedLiveblog = mockLatestPublishedContent[1]!;

const meta = {
	title: 'Dispatch/Compose/DispatchCreateNotificationModal',
	component: DispatchCreateNotificationModal,
	parameters: { layout: 'centered' },
	args: {
		appConfig: mockAppConfig,
		isOpen: true,
		onOpenChange: fn(),
		content: selectedArticle,
	},
	render: ({ appConfig, ...args }) => (
		<ConfigContext.Provider value={appConfig}>
			<DispatchCreateNotificationModal {...args} />
		</ConfigContext.Provider>
	),
} satisfies Meta<StoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ args, canvasElement }) => {
		const screen = within(canvasElement.ownerDocument.body);
		await expect(
			await screen.findByRole('dialog', {
				name: 'Choose an alert type for this content',
			}),
		).toBeVisible();
		const preview = screen.getByRole('article', {
			name: `${selectedArticle.headline} content`,
		});
		await expect(preview).toBeVisible();
		await expect(preview.children).toHaveLength(3);
		const previewMeta = preview.firstElementChild;
		if (!(previewMeta instanceof HTMLElement)) {
			throw new Error('Expected preview metadata');
		}
		const separatorStyle = getComputedStyle(previewMeta, '::after');
		const toRoundedPixels = (styleValue: string) =>
			Math.round(Number(styleValue.split('px').shift() ?? ''));
		const widthInPixels = toRoundedPixels(separatorStyle.width);
		const borderTopWidthInPixels = toRoundedPixels(
			separatorStyle.borderTopWidth,
		);
		await expect(widthInPixels).toEqual(36);
		await expect(borderTopWidthInPixels).toEqual(1);
		await expect(separatorStyle.opacity).toBe('1');
		await expect(separatorStyle.transform).not.toBe('none');
		await expect(
			within(preview).getByRole('link', {
				name: new RegExp(selectedArticle.headline),
			}),
		).toBeVisible();
		const appAlertLink = screen.getByRole('link', {
			name: 'Create an app alert',
		});
		const newsletterLink = screen.getByRole('link', {
			name: 'Create a newsletter email',
		});
		await expect(appAlertLink).toHaveAttribute(
			'href',
			withArticleUrl('/app-alert/create', selectedArticle.url),
		);
		await expect(newsletterLink).toHaveAttribute(
			'href',
			withArticleUrl('/newsletter-email/create', selectedArticle.url),
		);
		const previewWidth = preview.getBoundingClientRect().width;
		await expect(appAlertLink.getBoundingClientRect().width).toBeCloseTo(
			previewWidth,
			0,
		);
		await expect(newsletterLink.getBoundingClientRect().width).toBeCloseTo(
			previewWidth,
			0,
		);

		await userEvent.click(screen.getByRole('button', { name: 'Close Modal' }));
		await expect(args.onOpenChange).toHaveBeenCalledWith(false);
	},
};

export const ForLiveblog: Story = {
	args: {
		content: selectedLiveblog,
	},
};
