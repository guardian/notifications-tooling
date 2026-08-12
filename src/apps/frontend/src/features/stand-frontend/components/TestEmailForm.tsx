import { css } from '@emotion/react';
import { semanticSpacing } from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { TextInput } from '@guardian/stand/TextInput';
import { Typography } from '@guardian/stand/Typography';
import { useState } from 'react';

const emailPattern = /^[+a-zA-Z0-9_.'-]+@([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,6}$/;

const emailDomainWhitelist = ['theguardian.com', 'guardian.co.uk'];

const getInputError = (emailInput: string) => {
	if (!emailPattern.test(emailInput)) {
		return 'not a valid email';
	}
	const domain = emailInput.toLowerCase().split('@').pop();
	if (!domain || !emailDomainWhitelist.includes(domain)) {
		return 'not a guardian email address';
	}
	return undefined;
};

export const TestEmailForm = () => {
	const [emailInput, setEmailInput] = useState('');
	const inputError = getInputError(emailInput);

	return (
		<section
			css={{
				display: 'flex',
				flexDirection: 'column',
				gap: semanticSpacing.stackXs,
			}}
		>
			<Typography variant="bodyBoldMd">Test send</Typography>

			<TextInput
				description="Enter your email to send a test"
				type="email"
				placeholder="name@theguardian.com"
				aria-label="email address for test send"
				value={emailInput}
				onChange={setEmailInput}
				error={inputError}
				isInvalid={emailInput.length > 0 && !!inputError}
			/>
			<Typography element="div" variant="helpTextFormMd">
				Sends test only to the email address above, on the enabled channels -
				audience segments and timing are ignored.
			</Typography>

			<Button
				isDisabled={emailInput.length == 0 || !!inputError}
				cssOverrides={css({
					alignSelf: 'flex-start',
					marginTop: semanticSpacing.stackXs,
				})}
			>
				Send test notification
			</Button>
		</section>
	);
};
