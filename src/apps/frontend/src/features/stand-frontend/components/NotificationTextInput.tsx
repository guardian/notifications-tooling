import { baseSizing } from '@guardian/stand';
import { TextArea } from '@guardian/stand/TextArea';
import { CharacterCount } from './CharacterCount';

type Props = {
	label: string;
	description: string;
	value: string;
	update: { (value: string): void };
	hardLimit?: number;
	softLimit: number;
	allowLineBreak?: boolean;
};

export const NotificationTextInput = ({
	label,
	description,
	value,
	update,
	hardLimit,
	softLimit,
	allowLineBreak,
}: Props) => {
	return (
		<div>
			<TextArea
				label={label}
				description={description}
				value={value}
				theme={{
					shared: {
						height: `calc(${baseSizing.size16Rem} * 7)`,
					},
				}}
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
