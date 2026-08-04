import { css } from '@emotion/react';
import { baseSizing } from '@guardian/stand';
import { TextArea } from '@guardian/stand/TextArea';
import { CharacterCount } from './CharacterCount';

type Props = {
	label: string;
	description: string;
	placeholder?: string;
	value: string;
	update: { (value: string): void };
	hardLimit?: number;
	softLimit: number;
	allowLineBreak?: boolean;
	isDisabled?: boolean;
	error?: string;
};

export const NotificationTextInput = ({
	label,
	description,
	placeholder,
	value,
	update,
	hardLimit,
	softLimit,
	allowLineBreak,
	isDisabled,
	error,
}: Props) => {
	return (
		<div>
			<TextArea
				label={label}
				description={description}
				placeholder={placeholder}
				value={value}
				isInvalid={!!error}
				error={error}
				isDisabled={isDisabled}
				theme={{
					shared: {
						height: `calc(${baseSizing.size16Rem} * 7)`,
					},
				}}
				cssOverrides={css({
					textarea: {
						resize: 'vertical',
					},
				})}
				onChange={(value) => {
					if (allowLineBreak) {
						update(value);
					} else {
						update(value.replaceAll('\n', ''));
					}
				}}
			/>
			<CharacterCount
				count={value.length}
				softLimit={softLimit}
				hardLimit={hardLimit}
				fieldDescription={label}
			/>
		</div>
	);
};
