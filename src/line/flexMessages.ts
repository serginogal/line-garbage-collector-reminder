import type { messagingApi } from '@line/bot-sdk';
import { getAllAreas } from '@/services/userService';
import { getGlobalSendTime } from '@/services/settingsService';

const WELCOME_IMAGE_URL =
  'https://raw.githubusercontent.com/serginogal/images/refs/heads/main/bubbles/v2/welcome.png';
const AREA_SELECT_IMAGE_URL =
  'https://raw.githubusercontent.com/serginogal/images/refs/heads/main/area-select.png';

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
        url: WELCOME_IMAGE_URL,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
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
        url: AREA_SELECT_IMAGE_URL,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
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
