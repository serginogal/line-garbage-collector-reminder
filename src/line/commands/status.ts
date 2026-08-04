import type { messagingApi } from '@line/bot-sdk';
import { findByLineId, getArea } from '@/services/userService';
import { getGlobalSendTime } from '@/services/settingsService';
import { createStatusFlex } from '../flexMessages';

export async function handleStatus(
  client: messagingApi.MessagingApiClient,
  userId: string,
): Promise<void> {
  const user = findByLineId(userId);
  if (!user) {
    await client.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: '❌ ユーザーが見つかりません' }],
    });
    return;
  }

  const area = getArea(user.area_id);
  const areaName = area?.name ?? '不明';
  const sendTime = user.send_time ?? getGlobalSendTime();

  await client.pushMessage({
    to: userId,
    messages: [createStatusFlex({ areaName, subscribed: user.subscribed, sendTime })],
  });
}
