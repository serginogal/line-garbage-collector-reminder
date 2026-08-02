import type { messagingApi } from '@line/bot-sdk';
import { setSubscribed } from '@/services/userService';

export async function handleUnsubscribe(
  client: messagingApi.MessagingApiClient,
  userId: string,
): Promise<void> {
  setSubscribed(userId, false);
  await client.pushMessage({
    to: userId,
    messages: [{ type: 'text', text: '⏸️ 通知を停止しました' }],
  });
}
