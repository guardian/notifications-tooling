import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { act, renderHook } from '@testing-library/react';
import '../../happydom-setup';
import { useImageUrlCheck } from './use-image-url-check';

class ControllableImage {
	static instances: ControllableImage[] = [];

	onload: (() => void) | null = null;
	onerror: (() => void) | null = null;
	src = '';

	constructor() {
		ControllableImage.instances.push(this);
	}

	succeed() {
		this.onload?.();
	}

	fail() {
		this.onerror?.();
	}
}

const NativeImage = globalThis.Image;

type HookOptions = Parameters<typeof useImageUrlCheck>[0];
type HookResult = ReturnType<typeof useImageUrlCheck>;

const getPendingImage = () => {
	const image = ControllableImage.instances.at(-1);
	if (!image) {
		throw new Error('Expected an image check to be pending');
	}
	return image;
};

const setup = (options: Pick<HookOptions, 'imageUrl' | 'errorMessage'>) => {
	const onImageUrlChange = mock(() => undefined);
	const onUpdate = mock(() => undefined);
	const { result } = renderHook(() =>
		useImageUrlCheck({
			...options,
			onImageUrlChange,
			onUpdate,
		}),
	);

	return { result, onImageUrlChange, onUpdate };
};

const startImageCheck = (result: { current: HookResult }) => {
	let updatePromise!: Promise<void>;
	act(() => {
		updatePromise = result.current.checkAndUpdateImage();
	});
	return updatePromise;
};

const completeImageCheck = async (
	updatePromise: Promise<void>,
	result: 'succeed' | 'fail',
) => {
	await act(async () => {
		getPendingImage()[result]();
		await updatePromise;
	});
};

beforeEach(() => {
	ControllableImage.instances = [];
	globalThis.Image = ControllableImage as unknown as typeof Image;
});

afterEach(() => {
	globalThis.Image = NativeImage;
});

describe('useImageUrlCheck', () => {
	it('checks and updates a valid image URL', async () => {
		const { result, onUpdate } = setup({
			imageUrl: '  https://media.guim.co.uk/replacement.jpg  ',
		});

		const updatePromise = startImageCheck(result);

		expect(result.current.isCheckingImage).toBe(true);
		expect(result.current.isUpdateDisabled).toBe(true);
		expect(getPendingImage().src).toBe(
			'https://media.guim.co.uk/replacement.jpg',
		);

		await completeImageCheck(updatePromise, 'succeed');

		expect(onUpdate).toHaveBeenCalledWith(
			'https://media.guim.co.uk/replacement.jpg',
		);
		expect(result.current.isCheckingImage).toBe(false);
		expect(result.current.imageUpdated).toBe(true);
		expect(result.current.displayedErrorMessage).toBeUndefined();
	});

	it('reports a failed image load and clears the replacement', async () => {
		const { result, onImageUrlChange, onUpdate } = setup({
			imageUrl: 'https://media.guim.co.uk/missing.jpg',
		});

		const updatePromise = startImageCheck(result);
		await completeImageCheck(updatePromise, 'fail');

		expect(onUpdate).toHaveBeenCalledWith('');
		expect(result.current.imageUpdated).toBe(false);
		expect(result.current.isCheckingImage).toBe(false);
		expect(result.current.displayedErrorMessage).toBe('Unable to load image');

		act(() => result.current.handleImageUrlChange('replacement-2.jpg'));

		expect(onImageUrlChange).toHaveBeenCalledWith('replacement-2.jpg');
		expect(result.current.displayedErrorMessage).toBeUndefined();
	});

	it('rejects an invalid non-Guardian URL without loading it', async () => {
		const { result, onUpdate } = setup({
			imageUrl: 'https://example.com/replacement.jpg',
		});

		expect(result.current.isUpdateDisabled).toBe(true);
		expect(result.current.displayedErrorMessage).toBe(
			'Please enter a valid Guardian image URL',
		);

		await act(() => result.current.checkAndUpdateImage());

		expect(ControllableImage.instances).toHaveLength(0);
		expect(onUpdate).toHaveBeenCalledWith('');
		expect(result.current.imageUpdated).toBe(false);
	});

	it('clears the replacement without loading an empty URL', async () => {
		const { result, onUpdate } = setup({
			imageUrl: '   ',
		});

		await act(() => result.current.checkAndUpdateImage());

		expect(ControllableImage.instances).toHaveLength(0);
		expect(onUpdate).toHaveBeenCalledWith('');
		expect(result.current.imageUpdated).toBe(true);
	});

	it('clears previous status when the image URL changes', async () => {
		const { result, onImageUrlChange } = setup({
			imageUrl: 'https://media.guim.co.uk/replacement.jpg',
		});

		const updatePromise = startImageCheck(result);
		await completeImageCheck(updatePromise, 'succeed');
		expect(result.current.imageUpdated).toBe(true);

		act(() => result.current.handleImageUrlChange('replacement-2.jpg'));

		expect(onImageUrlChange).toHaveBeenCalledWith('replacement-2.jpg');
		expect(result.current.imageUpdated).toBe(false);
		expect(result.current.displayedErrorMessage).toBeUndefined();
	});

	it('passes through an existing form error', () => {
		const { result } = setup({
			imageUrl: '',
			errorMessage: 'Existing form error',
		});

		expect(result.current.displayedErrorMessage).toBe('Existing form error');
	});
});
