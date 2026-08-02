import type { WebhookEvent, MessageEvent, FollowEvent, UnfollowEvent } from '@line/bot-sdk';
import { lineClient } from './client';
import { findOrCreateUser, setSubscribed } from '@/services/userService';
import { getCommandHandler, getPrefixCommandHandler, isCommand } from './commands/index';
import { logger } from '@/lib/logger';
import { getGlobalSendTime } from '@/services/settingsService';

function getWelcomeMessage(): string {
  const sendTime = getGlobalSendTime();
  return `👋 こんにちは！

下連雀2丁目エリアの
ごみ収集リマインダーです 🗑️

毎日 ${sendTime} に
翌日のごみをお知らせします

/help でコマンド一覧を確認できます`;
}

async function handleFollow(event: FollowEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  findOrCreateUser(userId);
  setSubscribed(userId, true);

  await lineClient.pushMessage({
    to: userId,
    messages: [{ type: 'text', text: getWelcomeMessage() }],
  });
  logger.info('New user followed', { userId });
}

async function handleUnfollow(event: UnfollowEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  setSubscribed(userId, false);
  logger.info('User unfollowed', { userId });
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
          {
            type: 'text',
            text: '❓ そのコマンドは存在しません\n\n/help でコマンド一覧を確認できます',
          },
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
        case 'unfollow':
          await handleUnfollow(event);
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
