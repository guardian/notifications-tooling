export const htmlToTextContent = (html: string): string => {
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent;
};

export const parseHtml = (
	html?: string,
): {
	textContent: string;
	containsLinks: boolean;
} => {
	if (!html) {
		return {
			textContent: '',
			containsLinks: false,
		};
	}

	const div = document.createElement('div');
	div.innerHTML = html;

	return {
		textContent: div.textContent,
		containsLinks: !!div.querySelector('a'),
	};
};
