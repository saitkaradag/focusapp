import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, AppState, AppStateStatus, Modal, TextInput } from 'react-native';
import { saveSession, getCategories, saveCategories, DEFAULT_CATEGORIES } from '../utils/storage';

const HomeScreen = () => {
    // Durum değişkenleri (State)
    const [targetDuration, setTargetDuration] = useState(25 * 60);
    const [timer, setTimer] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [distractionCount, setDistractionCount] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const appState = useRef<AppStateStatus>(AppState.currentState);

    // Kategorileri yükle
    useEffect(() => {
        const loadCategories = async () => {
            const loadedCats = await getCategories();
            setCategories(loadedCats);
            if (loadedCats.length > 0) setSelectedCategory(loadedCats[0]);
        };
        loadCategories();
    }, []);

    // Zamanlayıcı Mantığı
    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 0) {
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        setIsActive(false);

                        // Seansı Kaydet
                        const duration = targetDuration;
                        const currentCategory = selectedCategory;
                        const currentDistractions = distractionCount;

                        saveSession({
                            date: new Date().toISOString(),
                            duration: duration,
                            category: currentCategory,
                            distractionCount: currentDistractions,
                        }).then(() => {
                            showSessionSummary('Süre Doldu!', currentCategory, duration, currentDistractions);
                        });

                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isActive, selectedCategory, distractionCount]);

    // Dikkat Dağınıklığı Takibi
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appState.current.match(/active/) &&
                (nextAppState === 'background' || nextAppState === 'inactive')
            ) {
                // Kullanıcı uygulamadan ayrıldı
                if (isActive) {
                    setIsActive(false);
                    setDistractionCount((prev) => prev + 1);
                }
            }

            appState.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isActive]);

    const handleAddCategory = async () => {
        if (newCategory.trim().length === 0) {
            Alert.alert('Hata', 'Kategori ismi boş olamaz.');
            return;
        }
        if (categories.includes(newCategory.trim())) {
            Alert.alert('Hata', 'Bu kategori zaten mevcut.');
            return;
        }

        const updatedCategories = [...categories, newCategory.trim()];
        setCategories(updatedCategories);
        setSelectedCategory(newCategory.trim());
        await saveCategories(updatedCategories);
        setNewCategory('');
        setNewCategory('');
        setIsModalVisible(false);
    };

    const handleRemoveCategory = (categoryToRemove: string) => {
        if (categories.length <= 1) {
            Alert.alert('Hata', 'En az bir kategori kalmalıdır.');
            return;
        }

        Alert.alert(
            'Kategoriyi Sil',
            `"${categoryToRemove}" kategorisini silmek istediğinize emin misiniz?`,
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        const updatedCategories = categories.filter((c) => c !== categoryToRemove);
                        setCategories(updatedCategories);
                        await saveCategories(updatedCategories);

                        if (selectedCategory === categoryToRemove) {
                            setSelectedCategory(updatedCategories[0]);
                        }
                    },
                },
            ]
        );
    };

    const showSessionSummary = (title: string, category: string, durationSeconds: number, distractions: number) => {
        const mins = Math.floor(durationSeconds / 60);
        const secs = durationSeconds % 60;
        const timeString = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

        Alert.alert(
            title,
            `Kategori: ${category}\nSüre: ${timeString}\nDikkat Dağınıklığı: ${distractions}`,
            [{ text: 'Tamam' }]
        );
    };

    const handleStart = () => setIsActive(true);
    const handlePause = () => setIsActive(false);
    const handleReset = () => {
        if (timer < targetDuration) {
            const elapsed = targetDuration - timer;
            showSessionSummary('Seans Sıfırlandı', selectedCategory, elapsed, distractionCount);
        }
        setIsActive(false);
        setTimer(targetDuration);
        setDistractionCount(0);
    };

    const handleIncrement = () => {
        if (!isActive) {
            setTargetDuration((prev) => {
                const newDuration = prev + 60;
                setTimer(newDuration);
                return newDuration;
            });
        }
    };

    const handleDecrement = () => {
        if (!isActive) {
            setTargetDuration((prev) => {
                if (prev <= 60) return prev;
                const newDuration = prev - 60;
                setTimer(newDuration);
                return newDuration;
            });
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Odaklanma Sayacı</Text>

            <View style={styles.timerContainer}>
                <TouchableOpacity onPress={handleDecrement} disabled={isActive} style={styles.adjustButton}>
                    <Text style={[styles.adjustButtonText, isActive && styles.disabledText]}>-</Text>
                </TouchableOpacity>
                <Text style={styles.timerText}>{formatTime(timer)}</Text>
                <TouchableOpacity onPress={handleIncrement} disabled={isActive} style={styles.adjustButton}>
                    <Text style={[styles.adjustButtonText, isActive && styles.disabledText]}>+</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>Kategori Seçimi:</Text>
            <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.categoryButton,
                            selectedCategory === cat && styles.categoryButtonActive,
                        ]}
                        onPress={() => !isActive && setSelectedCategory(cat)}
                        onLongPress={() => !isActive && handleRemoveCategory(cat)}
                        disabled={isActive}
                    >
                        <Text
                            style={[
                                styles.categoryText,
                                selectedCategory === cat && styles.categoryTextActive,
                            ]}
                        >
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    style={[styles.categoryButton, styles.addCategoryButton]}
                    onPress={() => setIsModalVisible(true)}
                    disabled={isActive}
                >
                    <Text style={styles.addCategoryText}>+</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.controls}>
                {!isActive ? (
                    <TouchableOpacity style={styles.buttonStart} onPress={handleStart}>
                        <Text style={styles.buttonText}>Başlat</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.buttonPause} onPress={handlePause}>
                        <Text style={styles.buttonText}>Duraklat</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.buttonReset} onPress={handleReset}>
                    <Text style={styles.buttonText}>Sıfırla</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.stats}>Dikkat Dağınıklığı: {distractionCount}</Text>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Yeni Kategori Ekle</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Kategori Adı"
                            value={newCategory}
                            onChangeText={setNewCategory}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setIsModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>İptal</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleAddCategory}
                            >
                                <Text style={styles.buttonText}>Kaydet</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    timerContainer: {
        marginBottom: 40,
        backgroundColor: '#fff',
        padding: 30,
        borderRadius: 150,
        width: 300,
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
        fontWeight: '600',
        color: '#555',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 30,
    },
    categoryButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 5,
        backgroundColor: '#fff',
    },
    categoryButtonActive: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    categoryText: {
        color: '#555',
    },
    categoryTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    controls: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    buttonStart: {
        backgroundColor: '#2ecc71',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginRight: 10,
    },
    buttonPause: {
        backgroundColor: '#e67e22',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        marginRight: 10,
    },
    buttonReset: {
        backgroundColor: '#e74c3c',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    stats: {
        marginTop: 20,
        fontSize: 16,
        color: '#7f8c8d',
    },
    adjustButton: {
        padding: 10,
    },
    adjustButtonText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#3498db',
        marginHorizontal: 20,
    },
    disabledText: {
        color: '#ccc',
    },
    addCategoryButton: {
        backgroundColor: '#e0e0e0',
        borderColor: '#bbb',
    },
    addCategoryText: {
        color: '#555',
        fontWeight: 'bold',
        fontSize: 18,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#95a5a6',
    },
    saveButton: {
        backgroundColor: '#2ecc71',
    },
});

export default HomeScreen;
