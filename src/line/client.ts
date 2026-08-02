import { messagingApi } from '@line/bot-sdk';
import { env } from '@/config/env';

export const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
});
