import { Button } from '@guardian/stand/Button';

const handleClick = () => {
	window.open('https://www.theguardian.com/uk', '_blank');
};
export const LatestPublishedContent = () => {
	return (
		<>
			<Button variant={'tertiary'} onClick={handleClick}>
				Click Open Latest Published Content
			</Button>
		</>
	);
};
