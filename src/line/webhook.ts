import type { WebhookEvent, MessageEvent, FollowEvent } from '@line/bot-sdk';
import { lineClient } from './client';
import { findOrCreateUser } from '@/services/userService';
import { getCommandHandler, getPrefixCommandHandler, isCommand } from './commands/index';
import { logger } from '@/lib/logger';
import { getGlobalSendTime } from '@/services/settingsService';

function getWelcomeMessage(): string {
  const sendTime = getGlobalSendTime();
  return `登録しました。

地域:
下連雀2丁目

毎朝${sendTime}に
ごみ収集のお知らせを送ります。`;
}

async function handleFollow(event: FollowEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  findOrCreateUser(userId);

  await lineClient.pushMessage({
    to: userId,
    messages: [{ type: 'text', text: getWelcomeMessage() }],
  });
  logger.info('New user followed', { userId });
}

async function handleMessage(event: MessageEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  if (event.message.type !== 'text') return;

  const text = event.message.text.trim();

  if (isCommand(text)) {
    const handler = getCommandHandler(text) ?? getPrefixCommandHandler(text);
    if (handler) {
      await handler(lineClient, userId, text);
      logger.info('Command executed', { userId, command: text });
    } else {
      await lineClient.pushMessage({
        to: userId,
        messages: [
          { type: 'text', text: '不明なコマンドです。/help で利用可能なコマンドを確認できます。' },
        ],
      });
    }
  }
}

export async function handleWebhook(events: WebhookEvent[]): Promise<void> {
  for (const event of events) {
    try {
      switch (event.type) {
        case 'follow':
          await handleFollow(event);
          break;
        case 'message':
          await handleMessage(event);
          break;
        default:
          logger.debug('Unhandled event type', { type: event.type });
      }
    } catch (err) {
      logger.error('Error handling webhook event', {
        type: event.type,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
