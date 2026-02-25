import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { taskService, categoryService } from '../../services';
import { validateTaskTitle } from '../../utils/validators';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

const STATUSES = ['todo', 'in_progress', 'done', 'archived'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function CreateTaskScreen({ navigation }) {
    const [form, setForm] = useState({
        title: '', description: '', status: 'todo',
        priority: 'medium', due_date: '', category_id: null,
    });
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        categoryService.list().then(({ data }) => setCategories(data)).catch(() => { });
    }, []);

    function validate() {
        const e = {};
        const titleErr = validateTaskTitle(form.title);
        if (titleErr) e.title = titleErr;
        if (form.due_date && !/^\d{4}-\d{2}-\d{2}$/.test(form.due_date)) {
            e.due_date = 'Use format YYYY-MM-DD';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleCreate() {
        if (!validate()) return;
        setLoading(true);
        try {
            await taskService.create({
                ...form,
                title: form.title.trim(),
                description: form.description.trim() || undefined,
                due_date: form.due_date || undefined,
            });
            Alert.alert('Success', 'Task created!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (err) {
            let msg = 'Failed to create task';
            if (err.response?.data?.error) {
                msg = err.response.data.error;
            } else if (err.response?.data?.errors) {
                // express-validator format
                msg = err.response.data.errors.map(e => e.msg).join('\n');
            }
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    }

    const Chip = ({ label, selected, onPress, color }) => (
        <TouchableOpacity
            style={[styles.chip, selected && { backgroundColor: color || COLORS.primary, borderColor: color || COLORS.primary }]}
            onPress={onPress}
        >
            <Text style={[styles.chipText, selected && { color: '#fff' }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.header}>
                    <Text style={styles.heading}>New Task</Text>
                    <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
                </View>

                {/* Title */}
                <Text style={styles.label}>Title *</Text>
                <TextInput
                    style={[styles.input, errors.title && styles.inputError]}
                    placeholder="Task title"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.title}
                    onChangeText={(v) => setForm({ ...form, title: v })}
                    maxLength={255}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textarea]}
                    placeholder="Optional description"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.description}
                    onChangeText={(v) => setForm({ ...form, description: v })}
                    multiline
                    numberOfLines={4}
                    maxLength={5000}
                />

                {/* Status */}
                <Text style={styles.label}>Status</Text>
                <View style={styles.chips}>
                    {STATUSES.map((s) => (
                        <Chip key={s} label={s.replace('_', ' ')} selected={form.status === s}
                            onPress={() => setForm({ ...form, status: s })} />
                    ))}
                </View>

                {/* Priority */}
                <Text style={styles.label}>Priority</Text>
                <View style={styles.chips}>
                    {PRIORITIES.map((p) => (
                        <Chip key={p} label={p} selected={form.priority === p}
                            onPress={() => setForm({ ...form, priority: p })}
                            color={COLORS[p]} />
                    ))}
                </View>

                {/* Due Date */}
                <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
                <TextInput
                    style={[styles.input, errors.due_date && styles.inputError]}
                    placeholder="2026-03-15"
                    placeholderTextColor={COLORS.textMuted}
                    value={form.due_date}
                    onChangeText={(v) => setForm({ ...form, due_date: v })}
                    maxLength={10}
                    keyboardType="numeric"
                />
                {errors.due_date && <Text style={styles.errorText}>{errors.due_date}</Text>}

                {/* Category */}
                {categories.length > 0 && (
                    <>
                        <Text style={styles.label}>Category</Text>
                        <View style={styles.chips}>
                            {categories.map((c) => (
                                <Chip key={c.id} label={c.name} selected={form.category_id === c.id}
                                    onPress={() => setForm({ ...form, category_id: c.id })}
                                    color={c.color} />
                            ))}
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={[styles.btn, loading && styles.btnDisabled]}
                    onPress={handleCreate}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <View style={styles.btnRow}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                            <Text style={styles.btnText}>Create Task</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: SPACING.lg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    heading: { fontSize: 28, fontWeight: '800', color: COLORS.primary },
    label: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600', marginBottom: SPACING.xs, marginTop: SPACING.md },
    input: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        color: COLORS.textPrimary,
        fontSize: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    inputError: { borderColor: COLORS.error },
    textarea: { height: 100, textAlignVertical: 'top' },
    errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
    chip: {
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginRight: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    chipText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '600', textTransform: 'capitalize' },
    btn: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        marginTop: SPACING.xl,
    },
    btnDisabled: { opacity: 0.6 },
    btnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
