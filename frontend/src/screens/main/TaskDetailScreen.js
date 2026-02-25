import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { taskService } from '../../services';
import { sanitizeText } from '../../utils/validators';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

const PRIORITY_COLOR = {
    low: COLORS.low,
    medium: COLORS.medium,
    high: COLORS.high,
    urgent: COLORS.urgent,
};

const STATUS_COLOR = {
    todo: COLORS.textMuted,
    in_progress: COLORS.primary,
    done: COLORS.success,
    archived: COLORS.textMuted,
};

export default function TaskDetailScreen({ route, navigation }) {
    const { taskId } = route.params;
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Reload task whenever we come back to this screen (e.g. after edit) ──
    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            taskService.get(taskId)
                .then(({ data }) => setTask(data))
                .catch(() => {
                    Alert.alert('Error', 'Task not found', [
                        { text: 'OK', onPress: () => navigation.goBack() },
                    ]);
                })
                .finally(() => setLoading(false));
        }, [taskId])
    );

    async function handleDelete() {
        Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await taskService.remove(taskId);
                        navigation.goBack();
                    } catch (err) {
                        Alert.alert('Error', err.response?.data?.error || 'Failed to delete task');
                    }
                },
            },
        ]);
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
        );
    }

    if (!task) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                {/* Priority & Status row */}
                <View style={styles.topRow}>
                    <View style={[styles.priorityBadge, { backgroundColor: (PRIORITY_COLOR[task.priority] || COLORS.primary) + '22', borderColor: PRIORITY_COLOR[task.priority] || COLORS.primary }]}>
                        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[task.priority] || COLORS.primary }]} />
                        <Text style={[styles.priorityLabel, { color: PRIORITY_COLOR[task.priority] || COLORS.primary }]}>
                            {task.priority?.toUpperCase()}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLOR[task.status] || COLORS.textMuted) + '22' }]}>
                        <Text style={[styles.statusText, { color: STATUS_COLOR[task.status] || COLORS.textMuted }]}>
                            {task.status?.replace('_', ' ')}
                        </Text>
                    </View>
                </View>

                <Text style={styles.title}>{sanitizeText(task.title)}</Text>

                {task.description ? (
                    <Text style={styles.description}>{sanitizeText(task.description)}</Text>
                ) : (
                    <Text style={styles.noDesc}>No description provided.</Text>
                )}

                {/* Meta info */}
                <View style={styles.metaRow}>
                    {task.due_date && (
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>📅 Due Date</Text>
                            <Text style={styles.metaValue}>{task.due_date.slice(0, 10)}</Text>
                        </View>
                    )}
                    {task.category_name && (
                        <View style={[styles.metaItem, { borderLeftColor: task.category_color || COLORS.primary }]}>
                            <Text style={styles.metaLabel}>🏷 Category</Text>
                            <Text style={[styles.metaValue, { color: task.category_color || COLORS.primary }]}>
                                {task.category_name}
                            </Text>
                        </View>
                    )}
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>📆 Created</Text>
                        <Text style={styles.metaValue}>
                            {task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}
                        </Text>
                    </View>
                </View>

                {/* Actions */}
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('EditTask', { taskId })}
                >
                    <Text style={styles.editBtnText}>✏️  Edit Task</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteBtnText}>🗑  Delete Task</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },

    topRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
    priorityBadge: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
        borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4,
        borderWidth: 1,
    },
    priorityDot: { width: 8, height: 8, borderRadius: 4 },
    priorityLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    statusBadge: { borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: 4 },
    statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },

    title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md, lineHeight: 34 },
    description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 24, marginBottom: SPACING.lg },
    noDesc: { fontSize: 14, color: COLORS.textMuted, fontStyle: 'italic', marginBottom: SPACING.lg },

    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
    metaItem: {
        backgroundColor: COLORS.bgCard,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        minWidth: 110,
        borderLeftWidth: 3,
        borderLeftColor: COLORS.primary,
        ...SHADOW.card,
    },
    metaLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginBottom: 4 },
    metaValue: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '700', textTransform: 'capitalize' },

    editBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    editBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    deleteBtn: {
        backgroundColor: COLORS.error + '15',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
});
