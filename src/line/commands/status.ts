import type { messagingApi } from '@line/bot-sdk';
import { findByLineId, getArea } from '@/services/userService';
import { getGlobalSendTime } from '@/services/settingsService';

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
  const subscriptionStatus = user.subscribed ? 'オン' : 'オフ';
  const sendTime = user.send_time ?? getGlobalSendTime();

  const message = `⚙️ 現在の設定

📍 エリア: ${areaName}
🔔 通知: ${subscriptionStatus}
⏰ 通知時間: ${sendTime}`;

  await client.pushMessage({ to: userId, messages: [{ type: 'text', text: message }] });
}
