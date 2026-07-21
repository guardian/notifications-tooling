export const MAX_BRAZE_TRIGGER_PROPERTIES_BYTES = 50_000;

export type BrazeEmailRequest = {
	campaignId: string;
	html: string;
	subject: string;
};

export type BrazeCampaignTriggerRequest = {
	broadcast: true;
	campaign_id: string;
	trigger_properties: {
		body: string;
		subject: string;
	};
};

const triggerPropertiesSize = (
	triggerProperties: BrazeCampaignTriggerRequest['trigger_properties'],
) => Buffer.byteLength(JSON.stringify(triggerProperties), 'utf8');

export const generateBrazeEmailRequest = ({
	campaignId,
	html,
	subject,
}: BrazeEmailRequest): BrazeCampaignTriggerRequest => {
	const triggerProperties = { body: html, subject };
	const size = triggerPropertiesSize(triggerProperties);

	if (size > MAX_BRAZE_TRIGGER_PROPERTIES_BYTES) {
		throw new RangeError(
			`Braze trigger properties exceed the ${MAX_BRAZE_TRIGGER_PROPERTIES_BYTES}-byte limit (received ${size} bytes).`,
		);
	}

	return {
		campaign_id: campaignId,
		// Each editorial office owns its audience in a separate campaign in Braze,
		// keeping data and reporting separate.
		broadcast: true,
		trigger_properties: triggerProperties,
	};
};
