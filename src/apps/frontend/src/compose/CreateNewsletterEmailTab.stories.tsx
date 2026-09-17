import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ACTIVE_SECTION_VIEWPORT_POSITION } from '../layout/constants';
import {
	completeNewsletterEmailFormValues,
	populatedNewsletterEmailComposerState,
} from '../testing/story-fixtures';
import { useNotificationFormStory } from '../testing/useNotificationFormStory';
import type { NotificationComposerState } from '../types';
import { defaultComposerState } from '../utils/notification-composer-reducer';
import type { NewsletterEmailFormValues } from '../utils/notification-forms';
import { CreateNewsletterEmailTab } from './CreateNewsletterEmailTab';

type StoryArgs = {
	composerState: NotificationComposerState;
	formValues?: Partial<NewsletterEmailFormValues>;
	containerMinWidth: string;
};

const meta: Meta<StoryArgs> = {
	title: 'Dispatch/Compose/CreateNewsletterEmailTab',
	component: CreateNewsletterEmailTab,
	args: {
		composerState: defaultComposerState,
		containerMinWidth: '1600px',
	},
	argTypes: {
		containerMinWidth: {
			control: 'text',
			description:
				'Width of the story container, used to exercise the tab layout breakpoints at 1310px and 1500px.',
		},
	},
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Newsletter email creation tab combining the notification form and preview with selected audience, channel, and delivery timing.',
			},
		},
	},
	render: function Render(args) {
		const { composerState, formValues, containerMinWidth } = args;
		return (
			<div
				style={{
					display: 'flex',
					minWidth: containerMinWidth,
					minHeight: '100vh',
					boxSizing: 'border-box',
				}}
			>
				{useNotificationFormStory(
					<CreateNewsletterEmailTab />,
					composerState,
					{},
					'newsletter',
					formValues,
				)}
			</div>
		);
	},
};

export default meta;
type Story = StoryObj<StoryArgs>;

export const Default: Story = {
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(
			canvas.getByText('Create newsletter email'),
		).toBeInTheDocument();
		await expect(
			canvas.queryByText(
				'The preview for the newsletter email will be shown below.',
			),
		).not.toBeInTheDocument();
	},
};

export const RepeatedInvalidSubmitScrollsToFirstError: Story = {
	args: {
		composerState: populatedNewsletterEmailComposerState,
		formValues: { ...completeNewsletterEmailFormValues, kicker: '' },
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const document = canvasElement.ownerDocument;
		const window = document.defaultView;
		if (!window) {
			throw new Error('Story window is not available');
		}
		const contentSection = document.getElementById('content-section');
		if (!contentSection) {
			throw new Error('Content section is not available');
		}
		const nativeScrollIntoView =
			contentSection.scrollIntoView.bind(contentSection);
		const scrollIntoView = fn((options?: ScrollIntoViewOptions) =>
			nativeScrollIntoView(options),
		);
		contentSection.scrollIntoView = scrollIntoView;
		const sendButton = canvas.getByRole('button', {
			name: 'Send newsletter email',
		});
		const submitFromBottom = async (expectedScrollCount: number) => {
			sendButton.scrollIntoView({ block: 'center' });
			await userEvent.click(sendButton);
			await waitFor(async () => {
				await expect(scrollIntoView).toHaveBeenCalledTimes(expectedScrollCount);
				await expect(scrollIntoView).toHaveBeenLastCalledWith({
					block: 'start',
				});
				await expect(window.location.hash).toBe('#content-section');
				await expect(
					canvas.getByRole('button', { name: 'Choose a kicker Kicker' }),
				).toHaveFocus();
			});
		};

		await submitFromBottom(1);
		await submitFromBottom(2);
	},
};

export const SectionNavigation: Story = {
	play: async ({ canvasElement, step }) => {
		const canvas = within(canvasElement);
		const document = canvasElement.ownerDocument;
		const window = document.defaultView;
		if (!window) {
			throw new Error('Story window is not available');
		}
		window.history.replaceState(null, '', '#article-section');
		window.dispatchEvent(new PopStateEvent('popstate'));

		const expectActiveSection = async (id: string) => {
			await waitFor(async () => {
				await expect(window.location.hash).toBe(`#${id}`);
				await expect(
					document.querySelector('[data-scrollspy-active]'),
				).toHaveAttribute('id', id);
			});
		};
		const scrollSectionToActivationPoint = (id: string) => {
			const section = document.getElementById(id);
			if (!section) {
				throw new Error(`Section "${id}" was not found`);
			}
			const sectionTop = section.getBoundingClientRect().top + window.scrollY;
			window.scrollTo({
				top:
					sectionTop -
					window.innerHeight * ACTIVE_SECTION_VIEWPORT_POSITION +
					1,
			});
			window.dispatchEvent(new Event('scroll'));
		};

		await step('starts with Article and channel active', async () => {
			window.scrollTo({ top: 0 });
			window.dispatchEvent(new Event('scroll'));
			await expectActiveSection('article-section');
		});

		await step('a direct hash change updates the active section', async () => {
			window.history.pushState(null, '', '#audience-section');
			window.dispatchEvent(new PopStateEvent('popstate'));
			await expectActiveSection('audience-section');
		});

		await step('clicking Content updates the hash and highlight', async () => {
			let contentButton = canvas.queryByRole('button', {
				name: 'Kicker, subject and preview',
			});
			if (!contentButton) {
				await userEvent.click(
					canvas.getByRole('button', {
						name: /Dispatch \/ Article and channel/,
					}),
				);
				contentButton = within(document.body).getByRole('button', {
					name: 'Kicker, subject and preview',
				});
			}
			await userEvent.click(contentButton);
			await expectActiveSection('content-section');
			window.dispatchEvent(new Event('scrollend'));
		});

		await step('scrolling activates compact sections', async () => {
			scrollSectionToActivationPoint('audience-section');
			await expectActiveSection('audience-section');

			scrollSectionToActivationPoint('delivery-timing-section');
			await expectActiveSection('delivery-timing-section');
		});

		await step('the natural page bottom activates Send', async () => {
			window.scrollTo({ top: document.documentElement.scrollHeight });
			window.dispatchEvent(new Event('scroll'));
			await expectActiveSection('send-button-section');
		});
	},
};
