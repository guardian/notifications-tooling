export const htmlToTextContent = (html: string): string => {
	const div = document.createElement('div');
	div.innerHTML = html;
	return div.textContent;
};

export const htmlToSingleLineText = (html?: string): string => {
	if (!html) {
		return '';
	}

	const div = document.createElement('div');
	div.innerHTML = html;

	div.querySelectorAll('br').forEach((element) => element.replaceWith(' '));
	div
		.querySelectorAll('p, div, li, blockquote, h1, h2, h3, h4, h5, h6')
		.forEach((element) => element.append(' '));

	return div.textContent.replace(/\s+/g, ' ').trim();
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
