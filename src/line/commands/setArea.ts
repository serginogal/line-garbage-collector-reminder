import type { messagingApi } from '@line/bot-sdk';
import { findByLineId, getArea, getAllAreas, setArea } from '@/services/userService';

export async function handleSetArea(
  client: messagingApi.MessagingApiClient,
  userId: string,
  text: string,
): Promise<void> {
  const arg = text.replace(/^\/set-area\s*/, '').trim();
  const areaId = parseInt(arg, 10);

  if (!arg || isNaN(areaId) || areaId <= 0) {
    const areas = getAllAreas();
    const areaList = areas.map((a) => `  ${a.id} - ${a.name}`).join('\n');
    await client.pushMessage({
      to: userId,
      messages: [
        {
          type: 'text',
          text: `❌ エリアIDを指定してください\n\n例: /set-area 2\n\n利用可能なエリア:\n${areaList}`,
        },
      ],
    });
    return;
  }

  const area = getArea(areaId);
  if (!area) {
    const areas = getAllAreas();
    const areaList = areas.map((a) => `  ${a.id} - ${a.name}`).join('\n');
    await client.pushMessage({
      to: userId,
      messages: [
        {
          type: 'text',
          text: `❌ エリアID ${areaId} が見つかりません\n\n利用可能なエリア:\n${areaList}`,
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
    messages: [
      { type: 'text', text: `✅ エリアを「${area.name}」(ID: ${areaId}) に変更しました！` },
    ],
  });
}
