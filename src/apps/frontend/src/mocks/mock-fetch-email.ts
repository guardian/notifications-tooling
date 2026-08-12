import type { RequestEmailHtml } from '../features/stand-frontend/types';

const buildHtml = (audience: string[]) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>email sample</title>
</head>
<body>
<table role="presentation" width="100%">
    <tbody>
        <tr><td>${audience.join('; ')}</td></tr>
        <tr><td valign="top">
            <table role="presentation" width="100%" cellpadding="0">
                <tbody>
                <tr><td valign="top">
                    <a 
                        href="https://www.theguardian.com/technology/2026/jul/28/apple-second-ever-5tn-company-as-investors-flee-ai-stocks?{{url_parameters_unstripped}}" 
                        style="color: #0077B6; text-decoration: none; display: inline-block; line-height: 0; width: 100%; height: 100%;">
                            <div style="border-top:1px solid #BABABA;padding-top:8px">
                                <div style="color:#052962;font-size:14px;font-weight:normal;margin:4px 0;font-family:Arial, sans-serif;line-height:1">
                                    Technology
                                </div>
                                <h2 class="mobile-text-20" style="font-size: 24px; font-family: Georgia, serif; color: #000000; margin: 0px 0 8px 0; line-height: 120%; font-weight: 400;">
                                    Apple becomes second $5tn company as investors flee AI stocks
                                </h2>
                                <div class="text" style="margin:18px 0 6px 0;font-size:14px;color:#707070;font-family:Arial, sans-serif;line-height:120%">
                                    The 41-year-old is set to join Philadelphia on a reported two-year, $8m deal with a player option after spending the last eight seasons with the Lakers
                                </div>
                            </div>
                    </a>
                </td></tr>
                </tbody>
            </table>
        </td></tr>
        <tr><td style="padding-bottom:11px">
            <a href="https://www.theguardian.com/technology/2026/jul/28/apple-second-ever-5tn-company-as-investors-flee-ai-stocks?{{url_parameters_unstripped}}" style="color: #0077B6; text-decoration: none; display: inline-block; line-height: 0; width: 100%; height: 100%;"><img src="https://i.guim.co.uk/img/media/16f725106781e4a9f75422731c886be80c8894aa/1152_0_5758_4606/master/5758.jpg?quality=85&amp;dpr=2&amp;width=650&amp;s=03f0baa983d6bbc6c3fd96cf0c952335" alt="A large white Apple logo is illuminated against a dark background and shadowed windows on the front of a store in Munich." width="100%" style="width:100%">
            </a>
        </td></tr>
    </tbody>
</table>
</body>
</html>                
`;

export const mockRequestEmailHtml: RequestEmailHtml = (request) => {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({
				html: buildHtml(request.audience),
				articleId:
					'technology/2026/jul/28/apple-second-ever-5tn-company-as-investors-flee-ai-stocks',
				newsletterId: 'some-newsletter',
			});
		}, 500);
	});
};
