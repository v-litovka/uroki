import { Pet, Profile } from '../models';

/** Вира и Венди — питомцы по умолчанию (как в исходных играх). */
export const DEFAULT_PETS: Pet[] = [
  { id: 'vira', name: 'Вира', kind: 'cat', sex: 'f', look: { body: '#ffffff', marks: '#222222', pattern: 'spots', build: 'fat' } },
  { id: 'wendy', name: 'Венди', kind: 'cat', sex: 'f', look: { body: '#9b856e', marks: '#6e5a46', pattern: 'stripes', build: 'thin' } },
];

/** Первый ребёнок. id 'me' — с ним уже связан весь прогресс, сохранённый до кабинетов. */
export const DEFAULT_CHILD: Profile = {
  id: 'me',
  name: 'Я',
  role: 'child',
  grade: 3,
  avatar: '🦄',
  petIds: ['vira', 'wendy'],
  settings: { roundSize: 10, hiddenGames: [] },
};

export const DEFAULT_PIN = '2924';

export const AVATARS = ['🦄', '🐱', '🐶', '🦊', '🐼', '🐸', '🐵', '🦁', '🐰', '🐯', '🐨', '🐙', '🦋', '🌸', '⭐', '🚀', '⚽', '🎨', '🎮', '👑'];

/** Палитра окрасов (подписи — для взрослого). */
export const COLORS: { id: string; name: string }[] = [
  { id: '#ffffff', name: 'белый' },
  { id: '#222222', name: 'чёрный' },
  { id: '#9aa0a6', name: 'серый' },
  { id: '#6b6f76', name: 'тёмно-серый' },
  { id: '#e8964a', name: 'рыжий' },
  { id: '#9b856e', name: 'серо-коричневый' },
  { id: '#6e5a46', name: 'коричневый' },
  { id: '#f1dcb5', name: 'кремовый' },
];

export const PET_EMOJI = ['🐱', '🐈', '🐈‍⬛', '😺', '🐶', '🐕', '🐩', '🦮', '🐹', '🐰', '🦜', '🐢'];
