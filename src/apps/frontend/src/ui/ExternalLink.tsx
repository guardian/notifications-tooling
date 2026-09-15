import { Link, type LinkProps } from '@guardian/stand/Link';
import { VisuallyHidden } from 'react-aria-components';

export const ExternalLink = ({ children, ...props }: LinkProps) => (
	<Link {...props} target="_blank" rel="noopener noreferrer">
		{children}
		<VisuallyHidden> (opens in a new tab)</VisuallyHidden>
	</Link>
);
