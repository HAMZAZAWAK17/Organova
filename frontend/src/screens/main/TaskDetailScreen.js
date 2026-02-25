import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { taskService, subtaskService } from '../../services';
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
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [subtaskLoading, setSubtaskLoading] = useState(false);

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

    async function handlePin() {
        try {
            await taskService.update(taskId, {
                title: task.title,
                is_pinned: !task.is_pinned
            });
            setTask({ ...task, is_pinned: !task.is_pinned });
        } catch (err) {
            Alert.alert('Error', 'Failed to update pinning status');
        }
    }

    async function handleAddSubtask() {
        if (!newSubtaskTitle.trim()) return;
        setSubtaskLoading(true);
        try {
            const { data } = await subtaskService.create({
                task_id: taskId,
                title: newSubtaskTitle.trim()
            });
            const newSubtask = { id: data.id, title: newSubtaskTitle.trim(), is_completed: 0 };
            setTask({ ...task, subtasks: [...(task.subtasks || []), newSubtask] });
            setNewSubtaskTitle('');
        } catch (err) {
            Alert.alert('Error', 'Failed to add subtask');
        } finally {
            setSubtaskLoading(false);
        }
    }

    async function handleToggleSubtask(subId, currentStatus) {
        try {
            await subtaskService.update(subId, { is_completed: !currentStatus });
            setTask({
                ...task,
                subtasks: task.subtasks.map(s => s.id === subId ? { ...s, is_completed: !currentStatus } : s)
            });
        } catch (err) {
            Alert.alert('Error', 'Failed to update subtask');
        }
    }

    async function handleDeleteSubtask(subId) {
        try {
            await subtaskService.remove(subId);
            setTask({
                ...task,
                subtasks: task.subtasks.filter(s => s.id !== subId)
            });
        } catch (err) {
            Alert.alert('Error', 'Failed to delete subtask');
        }
    }

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
                    <TouchableOpacity style={[styles.pinBtn, task.is_pinned && styles.pinBtnActive]} onPress={handlePin}>
                        <Ionicons name={task.is_pinned ? "pin" : "pin-outline"} size={14} color={task.is_pinned ? COLORS.primary : COLORS.textPrimary} />
                        <Text style={[styles.pinBtnText, task.is_pinned && { color: COLORS.primary }]}>{task.is_pinned ? 'Pinned' : 'Pin'}</Text>
                    </TouchableOpacity>
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
                            <View style={styles.metaLabelRow}>
                                <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                                <Text style={styles.metaLabel}>Due Date</Text>
                            </View>
                            <Text style={styles.metaValue}>{task.due_date.slice(0, 10)}</Text>
                        </View>
                    )}
                    {task.category_name && (
                        <View style={[styles.metaItem, { borderLeftColor: task.category_color || COLORS.primary }]}>
                            <View style={styles.metaLabelRow}>
                                <Ionicons name="tag-outline" size={12} color={COLORS.textMuted} />
                                <Text style={styles.metaLabel}>Category</Text>
                            </View>
                            <Text style={[styles.metaValue, { color: task.category_color || COLORS.primary }]}>
                                {task.category_name}
                            </Text>
                        </View>
                    )}
                    <View style={styles.metaItem}>
                        <View style={styles.metaLabelRow}>
                            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                            <Text style={styles.metaLabel}>Created</Text>
                        </View>
                        <Text style={styles.metaValue}>
                            {task.created_at ? new Date(task.created_at).toLocaleDateString() : '—'}
                        </Text>
                    </View>
                </View>

                {/* Subtasks Section */}
                <View style={styles.subtasksHeader}>
                    <Text style={styles.subtasksTitle}>Checklist</Text>
                    <View style={styles.subtasksInputContainer}>
                        <TextInput
                            style={styles.subtasksInput}
                            placeholder="Add subtask..."
                            placeholderTextColor={COLORS.textMuted}
                            value={newSubtaskTitle}
                            onChangeText={setNewSubtaskTitle}
                        />
                        <TouchableOpacity
                            style={styles.addSubtaskBtn}
                            onPress={handleAddSubtask}
                            disabled={subtaskLoading}
                        >
                            {subtaskLoading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="add" size={24} color="#fff" />}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.subtasksList}>
                    {task.subtasks?.map(s => (
                        <View key={s.id} style={styles.subtaskItem}>
                            <TouchableOpacity
                                style={[styles.checkbox, s.is_completed && styles.checkboxChecked]}
                                onPress={() => handleToggleSubtask(s.id, s.is_completed)}
                            >
                                {s.is_completed ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                            </TouchableOpacity>
                            <Text style={[styles.subtaskTitle, s.is_completed && styles.subtaskTitleDone]}>
                                {sanitizeText(s.title)}
                            </Text>
                            <TouchableOpacity onPress={() => handleDeleteSubtask(s.id)}>
                                <Ionicons name="close-circle-outline" size={20} color={COLORS.textMuted} />
                            </TouchableOpacity>
                        </View>
                    ))}
                    {(!task.subtasks || task.subtasks.length === 0) && (
                        <Text style={styles.noSubtasks}>No subtasks yet.</Text>
                    )}
                </View>

                {/* Actions */}
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('EditTask', { taskId })}
                >
                    <Ionicons name="create-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.editBtnText}>Edit Task</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} style={{ marginRight: 8 }} />
                    <Text style={styles.deleteBtnText}>Delete Task</Text>
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

    title: { fontSize: 26, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.md, lineHeight: 34 },
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
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    editBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    deleteBtn: {
        backgroundColor: COLORS.error + '15',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },

    pinBtn: {
        marginLeft: 'auto',
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    pinBtnActive: { backgroundColor: COLORS.primary + '22', borderColor: COLORS.primary },
    pinBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary },

    subtasksHeader: { marginTop: SPACING.lg, marginBottom: SPACING.sm },
    subtasksTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
    subtasksInputContainer: { flexDirection: 'row', gap: SPACING.xs },
    subtasksInput: {
        flex: 1,
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        padding: 10,
        color: COLORS.textPrimary,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    addSubtaskBtn: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        width: 44,
        justifyContent: 'center',
        alignItems: 'center'
    },
    addSubtaskBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },

    subtasksList: { marginBottom: SPACING.xl },
    subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border + '33'
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.primary,
        marginRight: SPACING.md,
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkboxChecked: { backgroundColor: COLORS.primary },
    checkboxIcon: { color: '#fff', fontSize: 12, fontWeight: '800' },
    subtaskTitle: { flex: 1, fontSize: 15, color: COLORS.textPrimary },
    subtaskTitleDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
    subtaskDelete: { padding: 4, color: COLORS.textMuted, fontSize: 16 },
    noSubtasks: { fontSize: 14, color: COLORS.textMuted, fontStyle: 'italic', marginTop: 4 },
});
