import type { messagingApi } from '@line/bot-sdk';

const HELP_MESSAGE = `利用可能なコマンド:

/help - コマンド一覧
/status - 現在の設定を表示
/subscribe - 通知を有効にする
/unsubscribe - 通知を無効にする
/set-time HH:00 - 通知時間を設定（例: /set-time 07:00）
/set-time default - デフォルト時間に戻す
/set-global-time HH:00 - 全体のデフォルト時間を変更（管理者のみ）`;

export async function handleHelp(
  client: messagingApi.MessagingApiClient,
  userId: string,
): Promise<void> {
  await client.pushMessage({ to: userId, messages: [{ type: 'text', text: HELP_MESSAGE }] });
}
