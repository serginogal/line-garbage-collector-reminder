import type { messagingApi } from '@line/bot-sdk';
import { findByLineId } from '@/services/userService';
import { findGarbageByAreaForWeek } from '@/services/garbageService';
import { createScheduleFlex } from '../flexMessages';

function getWeekBounds(): { start: string; end: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToSunday = day;
  const start = new Date(now);
  start.setDate(now.getDate() - diffToSunday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  return { start: fmt(start), end: fmt(end) };
}

export async function handleSchedule(
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

  const { start, end } = getWeekBounds();
  const schedules = findGarbageByAreaForWeek(user.area_id, start, end);

  await client.pushMessage({
    to: userId,
    messages: [createScheduleFlex(schedules, start, end)],
  });
}
