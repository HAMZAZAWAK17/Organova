import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, FlatList, TouchableOpacity,
    StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { taskService } from '../../services';
import { sanitizeText } from '../../utils/validators';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

const STATUS_COLOR = {
    todo: COLORS.textMuted,
    in_progress: COLORS.primary,
    done: COLORS.success,
    archived: COLORS.textMuted,
};

const PRIORITY_COLOR = {
    low: COLORS.low,
    medium: COLORS.medium,
    high: COLORS.high,
    urgent: COLORS.urgent,
};

export default function DashboardScreen({ navigation }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            setError(null);
            const { data } = await taskService.list({ limit: 20 });
            setTasks(data.data);
        } catch {
            setError('Failed to load tasks. Pull to refresh.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchTasks(); }, [fetchTasks]);

    const onRefresh = () => { setRefreshing(true); fetchTasks(); };

    const renderTask = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
                {/* sanitizeText prevents XSS in displayed content (OWASP Rule 1) */}
                <Text style={styles.cardTitle} numberOfLines={1}>{sanitizeText(item.title)}</Text>
            </View>
            {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{sanitizeText(item.description)}</Text>
            ) : null}
            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
                {item.due_date && (
                    <Text style={styles.dueDate}>📅 {item.due_date.slice(0, 10)}</Text>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>My Tasks</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('CreateTask')}
                >
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorBanner}>{error}</Text>}

            <FlatList
                data={tasks}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderTask}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No tasks yet. Tap "+ New" to create one!</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.lg },
    heading: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
    addBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    list: { padding: SPACING.md, paddingTop: 0 },
    card: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOW.card,
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xs },
    priorityDot: { width: 10, height: 10, borderRadius: 5, marginRight: SPACING.sm },
    cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, flex: 1 },
    cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
    statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    dueDate: { fontSize: 11, color: COLORS.textMuted },
    errorBanner: { color: COLORS.error, textAlign: 'center', padding: SPACING.sm },
    empty: { alignItems: 'center', marginTop: SPACING.xxl },
    emptyText: { color: COLORS.textSecondary, fontSize: 15 },
});
