import type { messagingApi } from '@line/bot-sdk';
import { findByLineId, setSendTime } from '@/services/userService';
import { setSetting, getGlobalSendTime } from '@/services/settingsService';
import { env } from '@/config/env';

const TIME_PATTERN = /^\d{2}:00$/;

export async function handleSetTime(
  client: messagingApi.MessagingApiClient,
  userId: string,
  text: string,
): Promise<void> {
  const arg = text.replace(/^\/set-time\s*/, '').trim();

  if (arg === 'default') {
    const user = findByLineId(userId);
    if (!user) {
      await client.pushMessage({
        to: userId,
        messages: [{ type: 'text', text: 'ユーザーが見つかりません。' }],
      });
      return;
    }

    setSendTime(userId, null);
    const globalDefault = getGlobalSendTime();
    await client.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: `デフォルト時間 (${globalDefault}) を使用します。` }],
    });
    return;
  }

  if (!TIME_PATTERN.test(arg)) {
    await client.pushMessage({
      to: userId,
      messages: [
        {
          type: 'text',
          text: '正しい形式で入力してください。\n/set-time HH:00（例: /set-time 07:00）\n/set-time default',
        },
      ],
    });
    return;
  }

  setSendTime(userId, arg);

  await client.pushMessage({
    to: userId,
    messages: [{ type: 'text', text: `通知時間を ${arg} に設定しました。` }],
  });
}

export async function handleSetGlobalTime(
  client: messagingApi.MessagingApiClient,
  userId: string,
  text: string,
): Promise<void> {
  if (userId !== env.ADMIN_LINE_USER_ID) {
    await client.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: 'このコマンドは管理者のみ使用できます。' }],
    });
    return;
  }

  const arg = text.replace(/^\/set-global-time\s*/, '').trim();

  if (!TIME_PATTERN.test(arg)) {
    await client.pushMessage({
      to: userId,
      messages: [
        {
          type: 'text',
          text: '正しい形式で入力してください。\n/set-global-time HH:00（例: /set-global-time 07:00）',
        },
      ],
    });
    return;
  }

  setSetting('send_time', arg);

  await client.pushMessage({
    to: userId,
    messages: [{ type: 'text', text: `デフォルトの通知時間を ${arg} に設定しました。` }],
  });
}
