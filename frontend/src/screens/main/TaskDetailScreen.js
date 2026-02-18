import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, StyleSheet,
    ActivityIndicator, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { taskService } from '../../services';
import { sanitizeText } from '../../utils/validators';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

const PRIORITY_COLOR = { low: COLORS.low, medium: COLORS.medium, high: COLORS.high, urgent: COLORS.urgent };

export default function TaskDetailScreen({ route, navigation }) {
    const { taskId } = route.params;
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        taskService.get(taskId)
            .then(({ data }) => setTask(data))
            .catch(() => Alert.alert('Error', 'Task not found'))
            .finally(() => setLoading(false));
    }, [taskId]);

    async function handleDelete() {
        Alert.alert('Delete Task', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    await taskService.remove(taskId);
                    navigation.goBack();
                },
            },
        ]);
    }

    if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
    if (!task) return null;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.priorityBar}>
                    <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLOR[task.priority] }]} />
                    <Text style={[styles.priorityLabel, { color: PRIORITY_COLOR[task.priority] }]}>
                        {task.priority.toUpperCase()}
                    </Text>
                </View>

                <Text style={styles.title}>{sanitizeText(task.title)}</Text>

                {task.description && (
                    <Text style={styles.description}>{sanitizeText(task.description)}</Text>
                )}

                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>Status</Text>
                        <Text style={styles.metaValue}>{task.status.replace('_', ' ')}</Text>
                    </View>
                    {task.due_date && (
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Due</Text>
                            <Text style={styles.metaValue}>{task.due_date.slice(0, 10)}</Text>
                        </View>
                    )}
                    {task.category_name && (
                        <View style={styles.metaItem}>
                            <Text style={styles.metaLabel}>Category</Text>
                            <Text style={[styles.metaValue, { color: task.category_color }]}>{task.category_name}</Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => navigation.navigate('EditTask', { taskId })}
                >
                    <Text style={styles.editBtnText}>✏️ Edit Task</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteBtnText}>🗑 Delete Task</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    scroll: { padding: SPACING.lg },
    priorityBar: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
    priorityDot: { width: 12, height: 12, borderRadius: 6, marginRight: SPACING.xs },
    priorityLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1 },
    title: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.md },
    description: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.lg },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
    metaItem: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, padding: SPACING.md, minWidth: 100, ...SHADOW.card },
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
        backgroundColor: COLORS.error + '22',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
});
