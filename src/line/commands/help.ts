import type { messagingApi } from '@line/bot-sdk';

const HELP_MESSAGE = `📋 コマンド一覧

/help - この画面を表示
/status - 現在の設定を確認
/subscribe - 通知をオン
/unsubscribe - 通知をオフ
/set-time HH:00 - 通知時間を変更
/set-time default - デフォルトに戻す
/set-area ID - エリアを変更

例: /set-time 07:00
例: /set-area 2`;

export async function handleHelp(
  client: messagingApi.MessagingApiClient,
  userId: string,
): Promise<void> {
  await client.pushMessage({ to: userId, messages: [{ type: 'text', text: HELP_MESSAGE }] });
}
