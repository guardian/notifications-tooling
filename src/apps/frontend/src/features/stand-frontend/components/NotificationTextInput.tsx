import { css } from '@emotion/react';
import { baseSizing, semanticColors, semanticSpacing } from '@guardian/stand';
import { TextArea } from '@guardian/stand/TextArea';
import { Typography } from '@guardian/stand/Typography';
import { useLayoutEffect, useRef, useState } from 'react';
import { CharacterCount } from './CharacterCount';

type Props = {
	name: string;
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

type NotificationTextInputWithPrefixProps = Props & {
	prefix?: string;
};

const styles = {
	notificationInputShell: css({
		position: 'relative',
	}),

	notificationInputPrefix: css({
		position: 'absolute',
		top: '12px',
		left: '12px',
		pointerEvents: 'none',
		zIndex: 1,
	}),
};

export const NotificationTextInput = ({
	name,
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
				name={name}
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

export const NotificationTextInputWithPrefix = ({
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
}: NotificationTextInputWithPrefixProps) => {
	const prefixRef = useRef<HTMLDivElement>(null);
	const [prefixWidth, setPrefixWidth] = useState(0);
	const showPrefix = Boolean(prefix && value);

	useLayoutEffect(() => {
		setPrefixWidth(showPrefix ? (prefixRef.current?.offsetWidth ?? 0) : 0);
	}, [prefix, showPrefix]);

	return (
		<div
			css={css({
				display: 'flex',
				flexDirection: 'column',
				gap: `${semanticSpacing.stackXxs}`,
			})}
		>
			<Typography variant="bodyBoldMd">{label}</Typography>
			<Typography
				variant="helpTextFormMd"
				css={css({ color: semanticColors.text.weak })}
			>
				{description}
			</Typography>
			<div css={styles.notificationInputShell}>
				{showPrefix && (
					<div ref={prefixRef} css={styles.notificationInputPrefix}>
						<Typography
							variant="bodyMd"
							cssOverrides={css({ color: `${semanticColors.text.disabled}` })}
						>
							{prefix}
						</Typography>
					</div>
				)}
				<TextArea
					aria-label={label}
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
							textIndent: showPrefix ? `${prefixWidth + 4}px` : undefined,
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
			</div>
			<CharacterCount
				count={value && prefix ? prefix.length + value.length : 0}
				softLimit={softLimit}
				hardLimit={hardLimit}
				fieldDescription={label}
			/>
		</div>
	);
};
