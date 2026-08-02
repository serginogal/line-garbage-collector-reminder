import type { messagingApi } from '@line/bot-sdk';
import { handleHelp } from './help';
import { handleStatus } from './status';
import { handleSubscribe } from './subscribe';
import { handleUnsubscribe } from './unsubscribe';

type CommandHandler = (client: messagingApi.MessagingApiClient, userId: string) => Promise<void>;

const commands: Record<string, CommandHandler> = {
  '/help': handleHelp,
  '/status': handleStatus,
  '/subscribe': handleSubscribe,
  '/unsubscribe': handleUnsubscribe,
};

export function getCommandHandler(command: string): CommandHandler | undefined {
  return commands[command];
}

export function isCommand(text: string): boolean {
  return text.startsWith('/');
}
