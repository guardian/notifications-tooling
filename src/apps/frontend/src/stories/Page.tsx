import type { FunctionComponent } from 'react';
import { EmailNotificationPage } from '../features/stand-frontend/EmailNotificationPage';
import type { UserResponse } from '../features/stand-frontend/get-config';
import './page.css';

export const Page: FunctionComponent<{
	presetUser?: UserResponse | undefined;
}> = (props) => {
	return <EmailNotificationPage presetUser={props.presetUser} />;
};
