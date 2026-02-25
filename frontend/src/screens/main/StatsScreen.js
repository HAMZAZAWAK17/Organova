import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { taskService } from '../../services';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

export default function StatsScreen() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const { data } = await taskService.getStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const StatCard = ({ label, value, color }) => {
        const getIcon = (lbl) => {
            const l = lbl.toLowerCase();
            if (l.includes('todo')) return 'list-circle-outline';
            if (l.includes('progress')) return 'sync-outline';
            if (l.includes('done')) return 'checkmark-done-circle-outline';
            if (l.includes('low')) return 'flag-outline';
            if (l.includes('medium')) return 'flag';
            if (l.includes('high')) return 'alert-circle-outline';
            if (l.includes('urgent')) return 'warning-outline';
            return 'stats-chart-outline';
        };

        return (
            <View style={[styles.statCard, { borderLeftColor: color || COLORS.primary }]}>
                <View style={styles.statCardHeader}>
                    <Text style={styles.statLabel}>{label}</Text>
                    <Ionicons name={getIcon(label)} size={14} color={color || COLORS.textMuted} />
                </View>
                <Text style={[styles.statValue, { color: color || COLORS.textPrimary }]}>{value}</Text>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} />}
            >
                <View style={styles.header}>
                    <Text style={styles.heading}>Statistics</Text>
                    <Ionicons name="stats-chart" size={28} color={COLORS.primary} />
                </View>

                <View style={styles.overview}>
                    <View style={styles.progressCircle}>
                        <Text style={styles.progressText}>{Math.round(stats?.completionRate || 0)}%</Text>
                        <Text style={styles.progressSubtext}>Done</Text>
                    </View>
                    <View style={styles.overviewStats}>
                        <Text style={styles.totalTasks}>{stats?.totalTasks || 0}</Text>
                        <View style={styles.totalLabelRow}>
                            <Ionicons name="list" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.totalLabel}>Total Tasks</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>By Status</Text>
                <View style={styles.statsGrid}>
                    {stats?.statusCounts.map(s => (
                        <StatCard key={s.status} label={s.status.replace('_', ' ')} value={s.count} color={COLORS[s.status] || COLORS.primary} />
                    ))}
                </View>

                <Text style={styles.sectionTitle}>By Priority</Text>
                <View style={styles.statsGrid}>
                    {stats?.priorityCounts.map(p => (
                        <StatCard key={p.priority} label={p.priority} value={p.count} color={COLORS[p.priority] || COLORS.primary} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scroll: { padding: SPACING.lg },
    heading: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
    overview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bgCard,
        padding: SPACING.xl,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOW.card
    },
    progressCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 8,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center'
    },
    progressText: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
    progressSubtext: { fontSize: 10, color: COLORS.textMuted, textTransform: 'uppercase' },
    overviewStats: { marginLeft: SPACING.xl },
    totalTasks: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
    totalLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    totalLabel: { fontSize: 14, color: COLORS.textSecondary },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md, marginTop: SPACING.lg },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
    statCard: {
        backgroundColor: COLORS.bgCard,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        width: '47%',
        borderLeftWidth: 4,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOW.card
    },
    statCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    statLabel: { fontSize: 12, color: COLORS.textMuted, textTransform: 'capitalize' },
    statValue: { fontSize: 20, fontWeight: '700' },
});
