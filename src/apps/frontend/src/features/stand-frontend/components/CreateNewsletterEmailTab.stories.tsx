import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { WithNotificationContext } from '../../../stories/story-helpers';
import { ACTIVE_SECTION_VIEWPORT_POSITION } from '../constants';
import { defaultState } from '../notification-reducer';
import type { NotificationState } from '../types';
import { CreateNewsletterEmailTab } from './CreateNewsletterEmailTab';

type StoryArgs = {
	notificationState: NotificationState;
};

const meta: Meta<StoryArgs> = {
	title: 'Stand Frontend/CreateNewsletterEmailTab',
	component: CreateNewsletterEmailTab,
	args: {
		notificationState: defaultState,
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
	render: (args) => {
		const { notificationState } = args;
		return (
			<div
				style={{
					display: 'flex',
					minWidth: '1600px',
					minHeight: '100vh',
					boxSizing: 'border-box',
				}}
			>
				{WithNotificationContext(
					<CreateNewsletterEmailTab />,
					notificationState,
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
			canvas.getByText(
				'The preview for the newsletter email will be shown below.',
			),
		).toBeInTheDocument();
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

		await step('clicking Content updates the hash and highlight', async () => {
			let contentButton = canvas.queryByRole('button', { name: 'Content' });
			if (!contentButton) {
				await userEvent.click(
					canvas.getByRole('button', {
						name: /Dispatch \/ Article and channel/,
					}),
				);
				contentButton = within(document.body).getByRole('button', {
					name: 'Content',
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
