import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { AppAlertThumbnailSwitch } from './AppAlertThumbnailSwitch';

const ControlledSwitch = (
	props: ComponentProps<typeof AppAlertThumbnailSwitch>,
) => {
	const [isSelected, setIsSelected] = useState(props.isSelected);

	return (
		<AppAlertThumbnailSwitch
			{...props}
			isSelected={isSelected}
			onChange={(selected) => {
				setIsSelected(selected);
				props.onChange(selected);
			}}
		/>
	);
};

const meta = {
	title: 'Stand Frontend/AppAlertThumbnailSwitch',
	component: AppAlertThumbnailSwitch,
	parameters: {
		docs: {
			description: {
				component:
					'Controls whether the imported article thumbnail is included in an app alert.',
			},
		},
	},
	args: {
		isSelected: true,
		isDisabled: false,
		onChange: fn(),
	},
	render: (args) => <ControlledSwitch {...args} />,
} satisfies Meta<typeof AppAlertThumbnailSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectedWithThumbnail: Story = {
	args: {
		onChange: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(toggle).toBeEnabled();
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-pressed', 'false');
		await expect(args.onChange).toHaveBeenLastCalledWith(false);

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');
		await expect(args.onChange).toHaveBeenLastCalledWith(true);
	},
};

export const DeselectedWithThumbnail: Story = {
	args: {
		isSelected: false,
		onChange: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(toggle).toBeEnabled();
		await expect(toggle).toHaveAttribute('aria-pressed', 'false');

		await userEvent.click(toggle);
		await expect(toggle).toHaveAttribute('aria-pressed', 'true');
		await expect(args.onChange).toHaveBeenCalledWith(true);
	},
};

export const WithoutThumbnail: Story = {
	args: {
		isSelected: false,
		isDisabled: true,
		onChange: fn(),
	},
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvas.getByRole('button', {
			name: 'Show article thumbnail image',
		});

		await expect(toggle).toBeDisabled();
		await expect(toggle).toHaveAttribute('aria-pressed', 'false');
		await userEvent.click(toggle);
		await expect(args.onChange).not.toHaveBeenCalled();
	},
};
