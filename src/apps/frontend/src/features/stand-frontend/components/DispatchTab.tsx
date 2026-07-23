import { css } from '@emotion/react';
import {
	semanticColors,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout } from '@guardian/stand/Layout';
import { buildDryRunNotificationRequest } from '../api/buildDryRunNotificationRequest';
import { useSendNotification } from '../api/useSendNotification';
import { useNotificationDraft } from '../useNotificationDraft';
import { CreateNotificationForm } from './CreateNotificationForm';
import { EmailPreviewSection } from './EmailPreviewSection';

export const DispatchTab = () => {
	const { draft, ...draftActions } = useNotificationDraft();
	const sendNotification = useSendNotification();

	const handleSend = () => {
		sendNotification.mutate(
			buildDryRunNotificationRequest(draftActions.idempotencyKey, draft),
			{ onSuccess: draftActions.rotateIdempotencyKey },
		);
	};

	return (
		<Layout.Main
			theme={{
				sm: { padding: { top: '0px', bottom: '0px' } },
				md: { padding: { top: '0px', bottom: '0px' } },
				lg: { padding: { top: '0px', bottom: '0px' } },
			}}
		>
			<Grid
				cssOverrides={css({
					height: '100%',
				})}
				theme={{
					sm: { gap: '0px', padding: `0px 0px 0px` },
					md: { gap: '0px', padding: `0px 0px ${semanticSpacing.stackLg}` },
					lg: { gap: '0px', padding: `0px 0px ${semanticSpacing.stackXl}` },
				}}
			>
				<Item
					size={8}
					cssOverrides={css({
						paddingLeft: semanticSpacing.stackSm,
						paddingRight: semanticSpacing.stackSm,
						borderRightWidth: semanticSizing.border.default,
						borderRightStyle: 'solid',
						borderRightColor: semanticColors.border.weak,
						paddingTop: semanticSpacing.stackSm,
					})}
				>
					<CreateNotificationForm
						draft={draft}
						onArticleUrlChange={draftActions.setArticleUrl}
						onKickerChange={draftActions.setKicker}
						onSubjectChange={draftActions.setSubject}
						onPreviewTextChange={draftActions.setPreviewText}
						onSend={handleSend}
						isSending={sendNotification.isPending}
						sendSucceeded={sendNotification.isSuccess}
						sendErrorMessage={sendNotification.error?.message}
					/>
				</Item>
				<Item
					size={4}
					cssOverrides={css({
						paddingRight: semanticSpacing.stackSm,
						paddingLeft: semanticSpacing.stackSm,
						paddingTop: semanticSpacing.stackSm,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'flex-start',
					})}
				>
					<EmailPreviewSection />
				</Item>
			</Grid>
		</Layout.Main>
	);
};
