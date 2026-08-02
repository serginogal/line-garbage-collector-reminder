import type { messagingApi } from '@line/bot-sdk';
import { setSubscribed } from '@/services/userService';

export async function handleSubscribe(
  client: messagingApi.MessagingApiClient,
  userId: string,
): Promise<void> {
  setSubscribed(userId, true);
  await client.pushMessage({
    to: userId,
    messages: [{ type: 'text', text: '通知を再開しました。' }],
  });
}
