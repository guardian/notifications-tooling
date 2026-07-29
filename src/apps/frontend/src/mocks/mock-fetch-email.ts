import type { RequestEmailHtml } from '../features/stand-frontend/types';

export const mockRequestEmailHtml: RequestEmailHtml = (articleId, options) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>email sample</title>
</head>
<body>
    <table>
        <tbody>
            <tr><td><h1>${articleId}</h1></td></tr>
            <tr><td>this is a sample email response for ${articleId}</td></tr>
            <tr><td>${JSON.stringify(options)}</td></tr>
        </tbody>
    </table>
</body>
</html>                
                `);
		}, 500);
	});
};
