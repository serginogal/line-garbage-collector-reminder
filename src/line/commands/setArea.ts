import type { messagingApi } from '@line/bot-sdk';
import { findByLineId, getArea, setArea } from '@/services/userService';
import { createAreaSelectionFlex } from '../flexMessages';

export async function handleSetArea(
  client: messagingApi.MessagingApiClient,
  userId: string,
  text: string,
): Promise<void> {
  const arg = text.replace(/^\/set-area\s*/, '').trim();
  const areaId = parseInt(arg, 10);

  if (!arg || isNaN(areaId) || areaId <= 0) {
    await client.pushMessage({
      to: userId,
      messages: [createAreaSelectionFlex()],
    });
    return;
  }

  const area = getArea(areaId);
  if (!area) {
    await client.pushMessage({
      to: userId,
      messages: [
        {
          type: 'text',
          text: `❌ エリアID ${areaId} が見つかりません\n\n/set-area で一覧を表示できます`,
        },
      ],
    });
    return;
  }

  const user = findByLineId(userId);
  if (!user) {
    await client.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: '❌ ユーザーが見つかりません' }],
    });
    return;
  }

  setArea(userId, areaId);

  await client.pushMessage({
    to: userId,
    messages: [{ type: 'text', text: `✅ エリアを「${area.name}」に変更しました！` }],
  });
}
