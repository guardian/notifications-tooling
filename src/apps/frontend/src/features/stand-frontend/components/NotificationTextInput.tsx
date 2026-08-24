import { css } from '@emotion/react';
import { baseSizing } from '@guardian/stand';
import { TextArea } from '@guardian/stand/TextArea';
import { useContext, useEffect } from 'react';
import { NotificationFormContext } from '../NotificationContext';
import { kickerNameMap } from '../option-values';
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
	prefix?: string;
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
	prefix,
}: Props) => {
	const { updateNotification } = useContext(NotificationFormContext);

	useEffect(() => {
		if (value === '') {
			return;
		}
		const kickerName = prefix ?? '';

		const existingPrefix = Object.values(kickerNameMap)
			.map((name) => `${name} : `)
			.find((prefix) => value.startsWith(prefix));

		const bareSubject = existingPrefix
			? value.slice(existingPrefix.length)
			: value;
		const nextSubject = `${kickerName}${bareSubject}`;
		if (nextSubject !== value) {
			updateNotification({
				type: 'modify-email-parameters',
				mod: { subject: nextSubject },
			});
		}
	}, [value, updateNotification, prefix]);

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
