import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Session {
    id: string;
    date: string;
    duration: number;
    category: string;
    distractionCount: number;
}

// Depolama anahtarları
const STORAGE_KEY = '@focus_sessions';
const CATEGORIES_KEY = '@focus_categories';

// Varsayılan kategoriler
export const DEFAULT_CATEGORIES = ['Ders Çalışma', 'Kodlama', 'Proje', 'Kitap Okuma'];

// Yeni bir seans kaydet
export const saveSession = async (session: Omit<Session, 'id'>) => {
    try {
        const existingSessions = await getSessions();
        const newSession: Session = {
            ...session,
            id: Date.now().toString(),
        };
        const updatedSessions = [...existingSessions, newSession];
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
        return newSession;
    } catch (e) {
        console.error('Failed to save session', e);
    }
};

// Tüm seansları getir
export const getSessions = async (): Promise<Session[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error('Failed to fetch sessions', e);
        return [];
    }
};

// Seansları temizle
export const clearSessions = async () => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
        console.error('Failed to clear sessions', e);
    }
};

// Kategorileri getir
export const getCategories = async (): Promise<string[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(CATEGORIES_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : DEFAULT_CATEGORIES;
    } catch (e) {
        console.error('Failed to fetch categories', e);
        return DEFAULT_CATEGORIES;
    }
};

// Kategorileri kaydet
export const saveCategories = async (categories: string[]) => {
    try {
        await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (e) {
        console.error('Failed to save categories', e);
    }
};
