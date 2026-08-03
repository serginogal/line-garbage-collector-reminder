import type {
  WebhookEvent,
  MessageEvent,
  FollowEvent,
  UnfollowEvent,
  PostbackEvent,
} from '@line/bot-sdk';
import { lineClient } from './client';
import { findOrCreateUser, getArea, setArea, setSubscribed } from '@/services/userService';
import { getCommandHandler, getPrefixCommandHandler, isCommand } from './commands/index';
import { logger } from '@/lib/logger';
import { createWelcomeFlex } from './flexMessages';

async function handleFollow(event: FollowEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  findOrCreateUser(userId);
  setSubscribed(userId, true);

  await lineClient.pushMessage({
    to: userId,
    messages: [createWelcomeFlex()],
  });
  logger.info('New user followed', { userId });
}

async function handleUnfollow(event: UnfollowEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  setSubscribed(userId, false);
  logger.info('User unfollowed', { userId });
}

async function handlePostback(event: PostbackEvent): Promise<void> {
  const userId = event.source.userId;
  if (!userId) return;

  const params = new URLSearchParams(event.postback.data);
  const action = params.get('action');

  if (action === 'set_area') {
    const areaId = parseInt(params.get('area_id') ?? '', 10);
    if (isNaN(areaId)) return;

    const area = getArea(areaId);
    if (!area) return;

    setArea(userId, areaId);

    await lineClient.pushMessage({
      to: userId,
      messages: [{ type: 'text', text: `✅ エリアを「${area.name}」に変更しました！` }],
    });
    logger.info('Area changed via postback', { userId, areaId, areaName: area.name });
  }
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
        case 'postback':
          await handlePostback(event);
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
