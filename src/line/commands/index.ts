import type { messagingApi } from '@line/bot-sdk';
import { handleHelp } from './help';
import { handleStatus } from './status';
import { handleSubscribe } from './subscribe';
import { handleUnsubscribe } from './unsubscribe';
import { handleSetTime, handleSetGlobalTime } from './setTime';
import { handleSetArea } from './setArea';
import { handleSchedule } from './schedule';

type CommandHandler = (
  client: messagingApi.MessagingApiClient,
  userId: string,
  text: string,
) => Promise<void>;

const exactCommands: Record<string, CommandHandler> = {
  '/help': handleHelp,
  '/status': handleStatus,
  '/subscribe': handleSubscribe,
  '/unsubscribe': handleUnsubscribe,
  '/schedule': handleSchedule,
};

const prefixCommands: { prefix: string; handler: CommandHandler }[] = [
  { prefix: '/set-time', handler: handleSetTime },
  { prefix: '/set-global-time', handler: handleSetGlobalTime },
  { prefix: '/set-area', handler: handleSetArea },
];

export function getCommandHandler(text: string): CommandHandler | undefined {
  return exactCommands[text];
}

export function getPrefixCommandHandler(text: string): CommandHandler | undefined {
  for (const { prefix, handler } of prefixCommands) {
    if (text === prefix || text.startsWith(`${prefix} `)) {
      return handler;
    }
  }
  return undefined;
}

export function isCommand(text: string): boolean {
  return text.startsWith('/');
}
