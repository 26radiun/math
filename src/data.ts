import { MeasurableObject, UnitType } from './types';

// The base scaling factor: 1 cm equals exactly 36 pixels in the UI space.
// This ensures that a 15cm ruler or object fits beautifully on mobile screens (approx 540px)
// while remaining highly legible and functionally accurate.
export const PIXELS_PER_CM = 36;

export const MEASURABLE_OBJECTS: MeasurableObject[] = [
  {
    id: 'pencil',
    name: '노란 연필',
    emoji: '✏️',
    lengthCm: 12,
    color: '#F4C430',
    description: '뾰족뾰족 귀여운 노란색 연필이에요.'
  },
  {
    id: 'caterpillar',
    name: '아기 애벌레',
    emoji: '🐛',
    lengthCm: 6,
    color: '#87D37C',
    description: '꼬물꼬물 움직이는 아주 귀여운 애벌레예요.'
  },
  {
    id: 'lollipop',
    name: '막대사탕',
    emoji: '🍭',
    lengthCm: 9,
    color: '#FC80A5',
    description: '알록달록 달콤한 딸기맛 뱅글사탕이에요.'
  },
  {
    id: 'chestnut',
    name: '가을 단풍잎',
    emoji: '🍁',
    lengthCm: 7,
    color: '#E67E22',
    description: '노랗고 빨갛게 잘 어울린 아기 단풍잎이에요.'
  },
  {
    id: 'key',
    name: '황금 열쇠',
    emoji: '🔑',
    lengthCm: 8,
    color: '#F39C12',
    description: '비밀 상자를 열 수 있는 신비로운 황금 열쇠예요.'
  },
  {
    id: 'toy_car',
    name: '빨간 꼬마차',
    emoji: '🚗',
    lengthCm: 11,
    color: '#E74C3C',
    description: '씽씽 달리는 작고 예쁜 강렬한 빨간색 자동차예요.'
  },
  {
    id: 'candy',
    name: '알사탕',
    emoji: '🍬',
    lengthCm: 4,
    color: '#9B59B6',
    description: '입을 달콤하게 해주는 보라색 알사탕이에요.'
  },
  {
    id: 'toothbrush',
    name: '내 칫솔',
    emoji: '🪥',
    lengthCm: 14,
    color: '#3498DB',
    description: '하루에 세 번 치카치카 칫솔이에요.'
  }
];

export const EXPLORATORY_UNITS: UnitType[] = [
  {
    id: 'clip',
    name: '클립',
    emoji: '📎',
    singularName: '클립',
    sizeCm: 3,
    color: '#4A90E2'
  },
  {
    id: 'eraser',
    name: '꼬마 지우개',
    emoji: '🧼',
    singularName: '지우개',
    sizeCm: 4,
    color: '#FF6B6B'
  },
  {
    id: 'block',
    name: '나무 블록',
    emoji: '🪵',
    singularName: '블록',
    sizeCm: 2,
    color: '#D4A373'
  },
  {
    id: 'span',
    name: '우리아기 뼘',
    emoji: '🤚',
    singularName: '뼘',
    sizeCm: 8,
    color: '#9B59B6'
  }
];
