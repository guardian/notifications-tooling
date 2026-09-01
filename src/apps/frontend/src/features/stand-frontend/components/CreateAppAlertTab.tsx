import { useContext } from 'react';
import {
	FALLBACK_TOPIC_TYPES,
	useChannelAudiences,
} from '../api/useChannelAudiences';
import { NotificationFormContext } from '../NotificationContext';
import { AppPreviewSection } from './AppPreviewSection';
import { CreateAppAlertForm } from './CreateAppAlertForm';
import { AppAlertDispatchDetails } from './DispatchReport';
import { NotificationTabLayout } from './NotificationTabLayout';
import { AppPreviewToggle } from './PreviewToggle';

export const CreateAppAlertTab = () => {
	const { updateNotification } = useContext(NotificationFormContext);
	const { data: audiences } = useChannelAudiences();

	const topicTypes =
		audiences?.channels['app-push'].topicTypes ?? FALLBACK_TOPIC_TYPES;

	return (
		<NotificationTabLayout
			channel="push"
			onResetNotification={() =>
				updateNotification({ type: 'reset-app-alert' })
			}
			previewToggle={<AppPreviewToggle topicTypes={topicTypes} />}
			renderForm={(activeSectionHref) => (
				<CreateAppAlertForm activeSectionHref={activeSectionHref} />
			)}
			previewSection={<AppPreviewSection topicTypes={topicTypes} />}
			dispatchDetails={<AppAlertDispatchDetails />}
		/>
	);
};
