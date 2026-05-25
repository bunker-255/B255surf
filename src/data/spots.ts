export interface Spot {
  id: string;
  name: {
    en: string;
    ru: string;
    he: string;
  };
  lat: number;
  lng: number;
}

export const SPOTS: Spot[] = [
  { id: 'haifa_bat_galim', name: { en: 'Haifa - Bat Galim', ru: 'Хайфа - Бат Галим', he: 'חיפה - בת גלים' }, lat: 32.834, lng: 34.978 },
  { id: 'caesarea', name: { en: 'Caesarea', ru: 'Кесария', he: 'קיסריה' }, lat: 32.502, lng: 34.887 },
  { id: 'netanya_sironit', name: { en: 'Netanya - Sironit', ru: 'Нетания - Сиронит', he: 'נתניה - סירונית' }, lat: 32.327, lng: 34.846 },
  { id: 'herzliya_marina', name: { en: 'Herzliya - Marina', ru: 'Герцлия - Марина', he: 'הרצליה - מרינה' }, lat: 32.162, lng: 34.795 },
  { id: 'tel_aviv_hh', name: { en: 'Tel Aviv - Hilton', ru: 'Тель Авив - Хилтон', he: 'תל אביב - הילטון' }, lat: 32.088, lng: 34.767 },
  { id: 'tel_aviv_dolphinarium', name: { en: 'Tel Aviv - Dolphinarium', ru: 'Тель Авив - Дельфинариум', he: 'תל אביב - דולפינריום' }, lat: 32.066, lng: 34.761 },
  { id: 'bat_yam', name: { en: 'Bat Yam - Riviera', ru: 'Бат Ям - Ривьера', he: 'בת ים - ריביירה' }, lat: 32.022, lng: 34.739 },
  { id: 'ashdod_kshatot', name: { en: 'Ashdod - Kshatot', ru: 'Ашдод - Кшатот', he: 'אשדוד - קשתות' }, lat: 31.796, lng: 34.629 },
  { id: 'ashkelon_marina', name: { en: 'Ashkelon', ru: 'Ашкелон', he: 'אשקלון' }, lat: 31.682, lng: 34.557 },
  { id: 'eilat_red_sea', name: { en: 'Eilat (Red Sea)', ru: 'Эйлат (Красное море)', he: 'אילת (ים סוף)' }, lat: 29.544, lng: 34.957 }
];
