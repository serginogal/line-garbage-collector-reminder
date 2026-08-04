import type { messagingApi } from '@line/bot-sdk';
import { getAllAreas } from '@/services/userService';
import { getGlobalSendTime } from '@/services/settingsService';

const IMAGES = {
  welcome:
    'https://raw.githubusercontent.com/serginogal/images/refs/heads/main/bubbles/v2/welcome.png',
  area: 'https://raw.githubusercontent.com/serginogal/images/refs/heads/main/bubbles/v2/area.png',
  help: 'https://raw.githubusercontent.com/serginogal/images/refs/heads/main/bubbles/v2/help.png',
  reminder:
    'https://raw.githubusercontent.com/serginogal/images/refs/heads/main/bubbles/v2/reminder.png',
  status:
    'https://raw.githubusercontent.com/serginogal/images/refs/heads/main/bubbles/v2/status.png',
  time: 'https://raw.githubusercontent.com/serginogal/images/refs/heads/main/bubbles/v2/time.png',
} as const;

const HERO_IMAGE_STYLE = {
  size: 'full' as const,
  aspectRatio: '20:13' as const,
  aspectMode: 'cover' as const,
};

function createAreaButtons(): messagingApi.FlexBox {
  const areas = getAllAreas();
  return {
    type: 'box',
    layout: 'vertical',
    spacing: 'md',
    contents: areas.map((area) => ({
      type: 'button' as const,
      style: 'primary' as const,
      color: '#27ACB2',
      height: 'md' as const,
      action: {
        type: 'postback' as const,
        label: area.name,
        data: `action=set_area&area_id=${area.id}`,
        displayText: `${area.name}を選択しました`,
      },
    })),
    paddingAll: '20px',
  };
}

export function createWelcomeFlex(): messagingApi.FlexMessage {
  const sendTime = getGlobalSendTime();

  return {
    type: 'flex',
    altText: 'エリアを選択してください',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'image',
        url: IMAGES.welcome,
        ...HERO_IMAGE_STYLE,
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '👋 こんにちは!',
            weight: 'bold',
            size: 'xl',
            align: 'center',
          },
          {
            type: 'text',
            text: `毎日${sendTime}に\n明日のゴミ収集日を\nお知らせします！`,
            size: 'xs',
            color: '#888888',
            align: 'center',
            margin: 'lg',
            wrap: true,
          },
        ],
        paddingAll: '20px',
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📍 まずは住んでいる\nエリアを選択してください',
            size: 'sm',
            color: '#555555',
            align: 'center',
            margin: 'md',
            wrap: true,
          },
          createAreaButtons(),
        ],
      },
      styles: {
        header: { separator: false },
        footer: { separator: true },
      },
    },
  };
}

export function createAreaSelectionFlex(): messagingApi.FlexMessage {
  return {
    type: 'flex',
    altText: 'エリアを選択してください',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'image',
        url: IMAGES.area,
        ...HERO_IMAGE_STYLE,
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🗑️ エリアを選択してください',
            weight: 'bold',
            size: 'lg',
            align: 'center',
          },
        ],
        paddingAll: '20px',
      },
      footer: createAreaButtons(),
      styles: {
        header: { separator: false },
        footer: { separator: true },
      },
    },
  };
}

export function createHelpFlex(): messagingApi.FlexMessage {
  return {
    type: 'flex',
    altText: 'コマンド一覧',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'image',
        url: IMAGES.help,
        ...HERO_IMAGE_STYLE,
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📋 コマンド一覧',
            weight: 'bold',
            size: 'lg',
            align: 'center',
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              { type: 'text', text: '/help - この画面を表示', size: 'sm', wrap: true },
              {
                type: 'text',
                text: '/status - 現在の設定を確認',
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
              {
                type: 'text',
                text: '/subscribe - 通知をオン',
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
              {
                type: 'text',
                text: '/unsubscribe - 通知をオフ',
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
              {
                type: 'text',
                text: '/schedule - 今週のスケジュールを確認',
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
              {
                type: 'text',
                text: '/set-time HH:00 - 通知時間を変更',
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
              {
                type: 'text',
                text: '/set-time default - デフォルトに戻す',
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
              {
                type: 'text',
                text: '/set-area ID - エリアを変更',
                size: 'sm',
                wrap: true,
                margin: 'md',
              },
            ],
            margin: 'lg',
          },
          {
            type: 'text',
            text: '例: /set-time 07:00\n例: /set-area 2',
            size: 'xs',
            color: '#888888',
            margin: 'lg',
            wrap: true,
          },
        ],
        paddingAll: '20px',
      },
      styles: {
        header: { separator: false },
        footer: { separator: false },
      },
    },
  };
}

export function createReminderFlex(categories: string[]): messagingApi.FlexMessage {
  const list = categories.length === 1 ? categories[0] : categories.map((c) => `- ${c}`).join('\n');

  return {
    type: 'flex',
    altText: '明日のゴミ収集',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'image',
        url: IMAGES.reminder,
        ...HERO_IMAGE_STYLE,
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '🗑️ 明日のごみ収集',
            weight: 'bold',
            size: 'lg',
            align: 'center',
          },
          {
            type: 'text',
            text: list,
            size: 'md',
            align: 'center',
            margin: 'lg',
            wrap: true,
          },
          {
            type: 'text',
            text: '⏰ 朝8時までに出してください',
            size: 'xs',
            color: '#888888',
            align: 'center',
            margin: 'lg',
            wrap: true,
          },
        ],
        paddingAll: '20px',
      },
      styles: {
        header: { separator: false },
        footer: { separator: false },
      },
    },
  };
}

export function createStatusFlex({
  areaName,
  subscribed,
  sendTime,
}: {
  areaName: string;
  subscribed: boolean;
  sendTime: string;
}): messagingApi.FlexMessage {
  return {
    type: 'flex',
    altText: '現在の設定',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'image',
        url: IMAGES.status,
        ...HERO_IMAGE_STYLE,
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⚙️ 現在の設定',
            weight: 'bold',
            size: 'lg',
            align: 'center',
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '📍 エリア', size: 'sm', color: '#888888', flex: 3 },
                  {
                    type: 'text',
                    text: areaName,
                    size: 'sm',
                    weight: 'bold',
                    flex: 7,
                    align: 'end',
                    scaling: true,
                  },
                ],
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '🔔 通知', size: 'sm', color: '#888888', flex: 4 },
                  {
                    type: 'text',
                    text: subscribed ? 'オン' : 'オフ',
                    size: 'sm',
                    weight: 'bold',
                    flex: 6,
                    align: 'end',
                  },
                ],
                margin: 'md',
              },
              {
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type: 'text', text: '⏰ 通知時間', size: 'sm', color: '#888888', flex: 4 },
                  {
                    type: 'text',
                    text: sendTime,
                    size: 'sm',
                    weight: 'bold',
                    flex: 6,
                    align: 'end',
                  },
                ],
                margin: 'md',
              },
            ],
            margin: 'lg',
          },
        ],
        paddingAll: '20px',
      },
      styles: {
        header: { separator: false },
        footer: { separator: false },
      },
    },
  };
}

export function createTimeFlex(message: string): messagingApi.FlexMessage {
  return {
    type: 'flex',
    altText: message,
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'image',
        url: IMAGES.time,
        ...HERO_IMAGE_STYLE,
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: message,
            size: 'md',
            align: 'center',
            wrap: true,
          },
        ],
        paddingAll: '20px',
      },
      styles: {
        header: { separator: false },
        footer: { separator: false },
      },
    },
  };
}

const TIME_OPTIONS = ['20:00', '21:00', '22:00'];

function createTimeButtons(): messagingApi.FlexBox {
  return {
    type: 'box',
    layout: 'vertical',
    spacing: 'md',
    contents: [
      ...TIME_OPTIONS.map((time) => ({
        type: 'button' as const,
        style: 'primary' as const,
        color: '#27ACB2',
        height: 'md' as const,
        action: {
          type: 'postback' as const,
          label: time,
          data: `action=set_time&time=${time}`,
          displayText: `${time}に変更`,
        },
      })),
      {
        type: 'button',
        style: 'secondary',
        height: 'md',
        action: {
          type: 'postback',
          label: 'デフォルトに戻す',
          data: 'action=set_time&time=default',
          displayText: 'デフォルトに戻す',
        },
      },
    ],
    paddingAll: '20px',
  };
}

export function createTimeSelectionFlex(): messagingApi.FlexMessage {
  return {
    type: 'flex',
    altText: '通知時間を選択してください',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'image',
        url: IMAGES.time,
        ...HERO_IMAGE_STYLE,
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '⏰ 通知時間を選択してください',
            weight: 'bold',
            size: 'lg',
            align: 'center',
          },
        ],
        paddingAll: '20px',
      },
      footer: createTimeButtons(),
      styles: {
        header: { separator: false },
        footer: { separator: true },
      },
    },
  };
}

interface ScheduleEntry {
  date: string;
  category: string;
}

const DAY_NAMES = ['日', '月', '火', '水', '木', '金', '土'];

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const dayName = DAY_NAMES[date.getDay()];
  return `${dayName} ${parseInt(month)}/${parseInt(day)}`;
}

export function createScheduleFlex(
  schedules: ScheduleEntry[],
  startDate: string,
  endDate: string,
): messagingApi.FlexMessage {
  const byDate = new Map<string, string[]>();
  for (const s of schedules) {
    const list = byDate.get(s.date) ?? [];
    list.push(s.category);
    byDate.set(s.date, list);
  }

  const dayContents: messagingApi.FlexBox[] = [];
  const start = new Date(startDate.replace(/-/g, '/'));
  const end = new Date(endDate.replace(/-/g, '/'));

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dd}`;
    const categories = byDate.get(dateStr);
    const label = formatDate(dateStr);

    if (categories && categories.length > 0) {
      dayContents.push({
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: label, size: 'sm', weight: 'bold' },
          ...categories.map((c) => ({
            type: 'text' as const,
            text: `  ${c}`,
            size: 'xs',
            color: '#555555',
            wrap: true,
          })),
        ],
        margin: 'md',
      });
    } else {
      dayContents.push({
        type: 'box',
        layout: 'vertical',
        contents: [
          { type: 'text', text: label, size: 'sm', weight: 'bold' },
          { type: 'text', text: '  （なし）', size: 'xs', color: '#BBBBBB' },
        ],
        margin: 'md',
      });
    }
  }

  return {
    type: 'flex',
    altText: '今週のごみ収集',
    contents: {
      type: 'bubble',
      size: 'mega',
      hero: {
        type: 'image',
        url: IMAGES.reminder,
        ...HERO_IMAGE_STYLE,
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: '📅 今週のごみ収集',
            weight: 'bold',
            size: 'lg',
            align: 'center',
          },
          {
            type: 'box',
            layout: 'vertical',
            contents: dayContents,
            margin: 'lg',
          },
        ],
        paddingAll: '20px',
      },
      styles: {
        header: { separator: false },
        footer: { separator: false },
      },
    },
  };
}
