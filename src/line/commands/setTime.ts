import type { messagingApi } from '@line/bot-sdk';
import { findByLineId, setSendTime } from '@/services/userService';
import { setSetting, getGlobalSendTime } from '@/services/settingsService';
import { env } from '@/config/env';
import { createTimeFlex, createTimeSelectionFlex } from '../flexMessages';

const TIME_PATTERN = /^\d{2}:00$/;

export async function handleSetTime(
  client: messagingApi.MessagingApiClient,
  userId: string,
  text: string,
): Promise<void> {
  const arg = text.replace(/^\/set-time\s*/, '').trim();

  if (!arg) {
    await client.pushMessage({
      to: userId,
      messages: [createTimeSelectionFlex()],
    });
    return;
  }

  if (arg === 'default') {
    const user = findByLineId(userId);
    if (!user) {
      await client.pushMessage({
        to: userId,
        messages: [{ type: 'text', text: '❌ ユーザーが見つかりません' }],
      });
      return;
    }

    setSendTime(userId, null);
    const globalDefault = getGlobalSendTime();
    await client.pushMessage({
      to: userId,
      messages: [createTimeFlex(`🔄 デフォルト時間 (${globalDefault}) を使用します`)],
    });
    return;
  }

  if (!TIME_PATTERN.test(arg)) {
    await client.pushMessage({
      to: userId,
      messages: [createTimeSelectionFlex()],
    });
    return;
  }

  setSendTime(userId, arg);

  await client.pushMessage({
    to: userId,
    messages: [createTimeFlex(`⏰ 通知時間を ${arg} に変更しました！`)],
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
      messages: [{ type: 'text', text: '🔒 このコマンドは管理者専用です' }],
    });
    return;
  }

  const arg = text.replace(/^\/set-global-time\s*/, '').trim();

  if (!TIME_PATTERN.test(arg)) {
    await client.pushMessage({
      to: userId,
      messages: [createTimeFlex('❌ 形式が正しくありません\n\n例: /set-global-time 07:00')],
    });
    return;
  }

  setSetting('send_time', arg);

  await client.pushMessage({
    to: userId,
    messages: [createTimeFlex(`⏰ デフォルトの通知時間を ${arg} に変更しました！`)],
  });
}
