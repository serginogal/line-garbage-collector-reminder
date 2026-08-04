import type { messagingApi } from '@line/bot-sdk';
import { createHelpFlex } from '../flexMessages';

export async function handleHelp(
  client: messagingApi.MessagingApiClient,
  userId: string,
): Promise<void> {
  await client.pushMessage({ to: userId, messages: [createHelpFlex()] });
}
