import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, spyOn, userEvent, within } from 'storybook/test';
import { SideNavigationPanel } from './SideNavigationPanel';

const Section = ({ id }: { id: string }) => (
	<section id={id} style={{ minHeight: '120px' }}>
		{id}
	</section>
);

const meta = {
	title: 'Dispatch/Compose/SideNavigationPanel',
	component: SideNavigationPanel,
	parameters: { layout: 'fullscreen' },
	render: (args) => (
		<div style={{ display: 'grid', gridTemplateColumns: '280px 1fr' }}>
			<SideNavigationPanel {...args} />
			<main>
				<Section id="article-section" />
				<Section id="alert-section" />
				<Section id="content-section" />
				<Section id="audience-section" />
				<Section id="delivery-timing-section" />
				<Section id="send-button-section" />
			</main>
		</div>
	),
} satisfies Meta<typeof SideNavigationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Newsletter: Story = {
	args: { channel: 'newsletter' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await expect(canvas.getByText('Kicker, subject and preview')).toBeVisible();
		await expect(canvas.getByText('Audience')).toBeVisible();
		await expect(
			canvas.queryByText('Alert type and editions'),
		).not.toBeInTheDocument();
	},
};

export const AppAlert: Story = {
	args: { channel: 'app-push' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const target = canvasElement.querySelector('#content-section');
		if (!(target instanceof HTMLElement)) {
			throw new Error('Expected the content section to be rendered');
		}
		const scrollIntoView = spyOn(target, 'scrollIntoView').mockImplementation(
			() => {},
		);

		await expect(canvas.getByText('Alert type and editions')).toBeVisible();
		await expect(canvas.getByText('Headline')).toBeVisible();
		await userEvent.click(canvas.getByText('Headline'));
		await expect(scrollIntoView).toHaveBeenCalledWith({
			behavior: 'smooth',
			block: 'start',
		});
		await expect(window.location.hash).toBe('#content-section');
	},
};
