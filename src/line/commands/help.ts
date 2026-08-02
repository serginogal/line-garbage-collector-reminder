import type { messagingApi } from '@line/bot-sdk';

const HELP_MESSAGE = `利用可能なコマンド:

/help
/status
/subscribe
/unsubscribe`;

export async function handleHelp(
  client: messagingApi.MessagingApiClient,
  userId: string,
): Promise<void> {
  await client.pushMessage({ to: userId, messages: [{ type: 'text', text: HELP_MESSAGE }] });
}
