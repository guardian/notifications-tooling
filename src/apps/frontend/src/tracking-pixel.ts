function getUserTelemetryClientUrl(hostname: string): string {
	switch (hostname) {
		case 'dispatch.gutools.co.uk':
			return 'https://user-telemetry.gutools.co.uk';
		case 'dispatch.code.dev-gutools.co.uk':
			return 'https://user-telemetry.code.dev-gutools.co.uk';
		case 'dispatch.local.dev-gutools.co.uk':
		default:
			return 'https://user-telemetry.local.dev-gutools.co.uk';
	}
}

function loadPixel(telemetryUrl: string, path: string): void {
	const image = new Image();
	image.src = `${telemetryUrl}/guardian-tool-accessed?app=dispatch&path=${path}`;
}

loadPixel(
	getUserTelemetryClientUrl(window.location.hostname),
	window.location.pathname,
);
