import { Button } from '@guardian/stand/Button';

interface RefreshButtonProps {
	onRefresh: () => void;
	isRefreshing?: boolean;
}

export const RefreshButton = ({
	onRefresh,
	isRefreshing = false,
}: RefreshButtonProps) => (
	<Button
		type="button"
		icon="refresh"
		size="sm"
		variant="secondary"
		isDisabled={isRefreshing}
		onClick={onRefresh}
	>
		Refresh activity
	</Button>
);
