import { css } from '@emotion/react';

interface GuardianLogoProps {
	size: number;
	borderRadius?: number;
	boxShadow?: string;
}

export const GuardianLogo = ({
	size,
	borderRadius = 0,
	boxShadow,
}: GuardianLogoProps) => (
	<svg
		aria-hidden="true"
		css={css({
			borderRadius,
			boxShadow,
			display: 'block',
			flex: '0 0 auto',
			height: size,
			width: size,
		})}
		focusable="false"
		viewBox="0 0 88 88"
		xmlns="http://www.w3.org/2000/svg"
	>
		<rect width="88" height="88" rx="16" fill="#052962" />
		<path
			fill="#fff"
			d="M45.8 18.2c-15.7 0-26.1 11.4-26.1 26.5 0 15.3 10.2 26 25.4 26 7.4 0 14.4-2.5 19.2-6.2V47.8h-19v2.8l6.7 1.1v15.1c-1.6.7-3.4 1.1-5.2 1.1-8.6 0-11.5-8.3-11.5-23.5 0-14.7 3-23.5 10.5-23.5 5.7 0 9.8 5.6 13.5 13.2h2.9l-1.1-12.3c-4.4-2.2-9.7-3.6-15.3-3.6Z"
		/>
	</svg>
);
