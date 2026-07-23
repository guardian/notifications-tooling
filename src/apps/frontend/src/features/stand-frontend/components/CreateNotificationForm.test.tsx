import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, mock } from 'bun:test';
import type { ComponentProps } from 'react';
import { CreateNotificationForm } from './CreateNotificationForm';

afterEach(cleanup);

const createProps = (
	overrides: Partial<ComponentProps<typeof CreateNotificationForm>> = {},
): ComponentProps<typeof CreateNotificationForm> => ({
	draft: {
		articleUrl: 'https://www.theguardian.com/world/2026/jul/22/example',
		kicker: 'none',
		subject: 'Example subject',
		previewText: 'Example preview',
	},
	onArticleUrlChange: () => {},
	onKickerChange: () => {},
	onSubjectChange: () => {},
	onPreviewTextChange: () => {},
	onSend: () => {},
	isSending: false,
	sendSucceeded: false,
	...overrides,
});

describe('CreateNotificationForm', () => {
	it('offers the dry-run validation action', () => {
		const onSend = mock();
		render(<CreateNotificationForm {...createProps({ onSend })} />);

		fireEvent.click(screen.getByRole('button', { name: 'Validate example' }));

		expect(onSend).toHaveBeenCalledTimes(1);
	});

	it('prevents another validation while one is pending', () => {
		render(<CreateNotificationForm {...createProps({ isSending: true })} />);

		const button = screen.getByRole('button', { name: 'Validate example' });

		expect((button as HTMLButtonElement).disabled).toBe(true);
	});

	it('reports when the backend accepts the example', () => {
		render(
			<CreateNotificationForm {...createProps({ sendSucceeded: true })} />,
		);

		expect(screen.getByText('Example accepted by backend.')).toBeTruthy();
	});

	it('reports when backend validation fails', () => {
		render(
			<CreateNotificationForm
				{...createProps({ sendErrorMessage: 'Backend unavailable' })}
			/>,
		);

		expect(
			screen.getByText('Validation failed: Backend unavailable'),
		).toBeTruthy();
	});
});
