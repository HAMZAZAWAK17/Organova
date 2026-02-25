import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { taskService } from '../../services';
import { sanitizeText } from '../../utils/validators';
import { useAuth } from '../../context/AuthContext';
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
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTasks = useCallback(async (search = '') => {
        try {
            setError(null);
            const { data } = await taskService.list({ limit: 50, search: search || undefined });
            // Response shape: { data: [...tasks], total, page, limit }
            setTasks(Array.isArray(data?.data) ? data.data : []);
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to load tasks. Pull to refresh.';
            setError(msg);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // ── Search Effect ────────
    useEffect(() => {
        const delay = setTimeout(() => {
            fetchTasks(searchQuery);
        }, 500);
        return () => clearTimeout(delay);
    }, [searchQuery, fetchTasks]);

    // ── Re-fetch every time the screen comes into focus ────────
    // This ensures the list updates after Create/Edit/Delete actions
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchTasks();
        }, [fetchTasks])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const renderTask = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, item.is_pinned && styles.pinnedCard]}
            onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[item.priority] || COLORS.textMuted }]} />
                <Text style={styles.cardTitle} numberOfLines={1}>{sanitizeText(item.title)}</Text>
                {item.is_pinned ? <Ionicons name="pin" size={16} color={COLORS.primary} style={styles.pinIcon} /> : null}
            </View>
            {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{sanitizeText(item.description)}</Text>
            ) : null}
            <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[item.status] || COLORS.textMuted) + '22' }]}>
                    <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] || COLORS.textMuted }]}>
                        {item.status.replace('_', ' ')}
                    </Text>
                </View>
                {item.due_date && (
                    <View style={styles.dueContainer}>
                        <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.dueDate}>{item.due_date.slice(0, 10)}</Text>
                    </View>
                )}
                {item.category_name && (
                    <View style={[styles.categoryBadge, { borderColor: item.category_color || COLORS.primary }]}>
                        <Text style={[styles.categoryText, { color: item.category_color || COLORS.primary }]}>
                            {item.category_name}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
                    <Text style={styles.heading}>My Tasks</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('CreateTask')}
                >
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search pages or tasks..."
                    placeholderTextColor={COLORS.textMuted}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {error && <Text style={styles.errorBanner}>{error}</Text>}

            <FlatList
                data={tasks}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderTask}
                contentContainerStyle={tasks.length === 0 ? styles.listEmpty : styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.primary}
                        colors={[COLORS.primary]}
                    />
                }
                ListEmptyComponent={
                    !error ? (
                        <View style={styles.empty}>
                            <Ionicons name="clipboard-outline" size={64} color={COLORS.textMuted} />
                            <Text style={styles.emptyText}>No tasks yet!</Text>
                            <Text style={styles.emptySubText}>Tap "+ New" to create your first task.</Text>
                        </View>
                    ) : null
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        padding: SPACING.lg,
        paddingBottom: SPACING.md,
    },
    greeting: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 2 },
    heading: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
    addBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    list: { padding: SPACING.md, paddingTop: 0 },
    listEmpty: { flexGrow: 1, padding: SPACING.md, paddingTop: 0 },
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
    pinnedCard: { borderColor: COLORS.primary, borderWidth: 1.5 },
    pinIcon: { marginLeft: SPACING.xs },
    dueContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    searchContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
    searchInput: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        color: COLORS.textPrimary,
        fontSize: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cardDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: SPACING.sm, lineHeight: 18 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, flexWrap: 'wrap' },
    statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.sm, paddingVertical: 2 },
    statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
    dueDate: { fontSize: 11, color: COLORS.textMuted },
    categoryBadge: {
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderWidth: 1,
    },
    categoryText: { fontSize: 11, fontWeight: '600' },
    errorBanner: { color: COLORS.error, textAlign: 'center', padding: SPACING.sm, marginHorizontal: SPACING.md },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.xxl },
    emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
    emptyText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: SPACING.xs },
    emptySubText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
});
