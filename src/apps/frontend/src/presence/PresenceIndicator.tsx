import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Avatar } from '@guardian/stand/Avatar';
import { Typography } from '@guardian/stand/Typography';
import { useContext } from 'react';
import { ConfigContext } from '../config/ConfigContext';
import type { PresenceEntry, PresencePerson } from './presence-client';
import { usePresence } from './use-presence';

interface PresenceIndicatorProps {
	presences: PresenceEntry[];
}

const fullName = ({ firstName, lastName, email }: PresencePerson) =>
	`${firstName} ${lastName}`.trim() || email;

const initials = ({ firstName, lastName }: PresencePerson) =>
	`${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();

export const PresenceIndicator = ({ presences }: PresenceIndicatorProps) => {
	const colleagues = Array.from(
		new Map(
			presences
				.map(({ clientId }) => clientId.person)
				.map((person) => [person.email, person]),
		).values(),
	);
	console.log({ colleagues });
	if (colleagues.length === 0) {
		return null;
	}

	return (
		<section
			css={css({
				display: 'flex',
				alignItems: 'center',
				gap: semanticSpacing.stackXs,
				padding: `${semanticSpacing.stackXs} ${semanticSpacing.stackMd}`,
				backgroundColor: semanticColors.bg.raisedLevel1,
			})}
		>
			<Typography variant="bodyXs" element="span">
				Viewing this article
			</Typography>
			<ul
				aria-label="Colleagues viewing this article"
				css={css({
					display: 'flex',
					alignItems: 'center',
					gap: semanticSpacing.stackXxs,
					listStyle: 'none',
					margin: 0,
					padding: 0,
				})}
			>
				{colleagues.map((person) => {
					const name = fullName(person);
					return (
						<li key={person.email} aria-label={name} title={name}>
							<Avatar alt={name} initials={initials(person)} size="sm" />
						</li>
					);
				})}
			</ul>
		</section>
	);
};

export const ArticlePresenceIndicator = ({
	contentId,
}: {
	contentId?: string;
}) => {
	const config = useContext(ConfigContext);
	const presences = usePresence(contentId, config);

	if (!config) {
		return null;
	}

	return <PresenceIndicator presences={presences} />;
};
