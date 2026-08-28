import { describe, expect, it } from 'bun:test';
import type {
    ChannelAudienceResponse,
    NotificationSummary,
} from './api/schemas';
import { notificationListResponseSchema } from './api/schemas';
import { mapNotificationToHistoryAlert } from './notification-history-mapper';

const baseNotification: NotificationSummary = {
    id: '939f106b-4be9-414a-ba14-f1e8c615696f',
    idempotencyKey: '8ced4a9e-344c-4a63-b368-ba02c084a8a5',
    kind: 'send',
    status: 'delivered',
    sender: 'editorial-newsletters',
    createdByEmail: 'joshua.anderson@guardian.co.uk',
    dryRun: false,
    scheduledFor: null,
    content: {},
    channels: {},
    createdAt: '2026-08-26T14:52:16.143Z',
    updatedAt: '2026-08-26T14:52:17.637Z',
};

const audiences: ChannelAudienceResponse = {
    channels: {
        newsletter: { segments: [] },
        'app-push': {
            topicTypes: [
                {
                    id: 'sport',
                    label: 'Sport news',
                    editions: [],
                },
            ],
        },
    },
};

describe('notificationListResponseSchema', () => {
    it('accepts the GET /v1/notifications response envelope', () => {
        expect(
            notificationListResponseSchema.parse({
                total: 1,
                limit: 20,
                offset: 0,
                notifications: [baseNotification],
            }).notifications,
        ).toHaveLength(1);
    });
});

describe('mapNotificationToHistoryAlert', () => {
    it('maps a newsletter summary and its segment destinations', () => {
        const alert = mapNotificationToHistoryAlert({
            ...baseNotification,
            content: {
                items: {
                    'lead-story': {
                        type: 'newsletter',
                        title: '‘National scandal’: extreme heat linked to 40,000',
                        body: 'ONS data shows rising toll of climate crisis',
                        link: 'https://www.theguardian.com/environment/2026/aug/26/deaths-england-hottest-days-extreme-weather',
                    },
                },
            },
            channels: {
                newsletter: {
                    audience: { type: 'segment', items: ['US'] },
                    compose: {
                        items: ['lead-story'],
                        subject:
                            'Breaking News: ‘National scandal’: extreme heat linked to 40,000',
                    },
                },
            },
        });

        expect(alert).toMatchObject({
            title: '‘National scandal’: extreme heat linked to 40,000',
            href: 'https://www.theguardian.com/environment/2026/aug/26/deaths-england-hottest-days-extreme-weather',
            channel: 'email',
            alertType: 'Breaking News',
            sentFrom: 'Unknown',
            sentBy: 'joshua.anderson@guardian.co.uk',
            sentTo: ['US'],
            sentAt: '2026-08-26T14:52:16.143Z',
            status: 'Sent',
        });
        expect(alert?.thumbnailUrl).toBeUndefined();
    });

    it('uses a generic newsletter label when the subject has no known kicker', () => {
        const alert = mapNotificationToHistoryAlert({
            ...baseNotification,
            content: {
                items: {
                    'lead-story': {
                        type: 'newsletter',
                        title: 'Morning briefing',
                        body: 'Summary',
                        link: 'https://www.theguardian.com/world',
                    },
                },
            },
            channels: {
                newsletter: {
                    audience: { type: 'segment', items: ['UK'] },
                    compose: {
                        items: ['lead-story'],
                        subject: 'Morning briefing',
                    },
                },
            },
        });

        expect(alert?.alertType).toBe('Newsletter');
    });

    it('maps app-push compose, topic label, media, and edition ids', () => {
        const alert = mapNotificationToHistoryAlert(
            {
                ...baseNotification,
                status: 'partially_delivered',
                content: {
                    items: {
                        lead: {
                            type: 'app-push',
                            title: 'Final score',
                            body: 'Full time',
                            link: 'https://www.theguardian.com/sport',
                            media: {
                                type: 'image',
                                imageUrl: 'https://media.guim.co.uk/image.jpg',
                                thumbnailUrl: 'https://media.guim.co.uk/thumb.jpg',
                            },
                        },
                    },
                },
                channels: {
                    'app-push': {
                        audience: {
                            type: 'topic',
                            items: [
                                { type: 'sport', name: 'international' },
                                { type: 'sport', name: 'europe' },
                            ],
                        },
                        compose: { use: 'lead' },
                    },
                },
            },
            audiences,
        );

        expect(alert).toMatchObject({
            channel: 'push',
            alertType: 'Sport news',
            thumbnailUrl: 'https://media.guim.co.uk/thumb.jpg',
            sentTo: ['INT', 'EU'],
            status: 'Partially sent',
        });
    });

    it('omits a summary whose stored payload cannot drive the table', () => {
        expect(mapNotificationToHistoryAlert(baseNotification)).toBeUndefined();
    });
});