import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { getSessions, Session } from '../utils/storage';

const screenWidth = Dimensions.get('window').width;

const ReportsScreen = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    // Verileri yükle
    const loadData = async () => {
        const data = await getSessions();
        setSessions(data);
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    // Süreyi formatlama yardımcısı
    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}s ${mins}dk`;
        return `${mins}dk`;
    };

    //İstatistik Hesaplamaları
    const totalDuration = sessions.reduce((acc, curr) => acc + curr.duration, 0);
    const totalDistractions = sessions.reduce((acc, curr) => acc + curr.distractionCount, 0);

    const today = new Date().toDateString();
    const todayDuration = sessions
        .filter((s) => new Date(s.date).toDateString() === today)
        .reduce((acc, curr) => acc + curr.duration, 0);

    // Sütun Grafiği: Son 7 gün
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toDateString();
    });

    const barData = {
        labels: last7Days.map((dateStr) => {
            const date = new Date(dateStr);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        datasets: [
            {
                data: last7Days.map((dateStr) => {
                    const durationDocs = sessions
                        .filter((s) => new Date(s.date).toDateString() === dateStr)
                        .reduce((acc, curr) => acc + curr.duration, 0);
                    return durationDocs / 60;
                }),
            },
        ],
    };

    // Pasta Grafiği
    const categoryStats: { [key: string]: number } = {};
    sessions.forEach((s) => {
        if (!categoryStats[s.category]) categoryStats[s.category] = 0;
        categoryStats[s.category] += s.duration;
    });

    const pieData = Object.keys(categoryStats).map((cat, index) => {
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#34495e'];
        return {
            name: cat,
            population: Math.round(categoryStats[cat] / 60), // Minutes
            color: colors[index % colors.length],
            legendFontColor: '#7f8c8d',
            legendFontSize: 12,
        };
    });

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{formatDuration(todayDuration)}</Text>
                    <Text style={styles.statLabel}>Bugün</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{formatDuration(totalDuration)}</Text>
                    <Text style={styles.statLabel}>Toplam Süre</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{totalDistractions}</Text>
                    <Text style={styles.statLabel}>Dikkat Dağınıklığı</Text>
                </View>
            </View>

            <Text style={styles.chartTitle}>Son 7 Gün (Dakika)</Text>
            <BarChart
                data={barData}
                width={screenWidth - 30}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                style={styles.chart}
                showValuesOnTopOfBars
            />

            <Text style={styles.chartTitle}>Kategori Dağılımı (Dakika)</Text>
            {pieData.length > 0 ? (
                <PieChart
                    data={pieData}
                    width={screenWidth - 30}
                    height={220}
                    chartConfig={{
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    }}
                    accessor={'population'}
                    backgroundColor={'transparent'}
                    paddingLeft={'15'}
                    absolute
                />
            ) : (
                <Text style={styles.noDataText}>Veri yok</Text>
            )}

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f5f5f5',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '30%',
        elevation: 2,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    statLabel: {
        fontSize: 12,
        color: '#95a5a6',
        marginTop: 5,
        textAlign: 'center',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        marginTop: 10,
        color: '#333',
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16,
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
    },
});

export default ReportsScreen;
