import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { noteService } from '../../services';
import { sanitizeText } from '../../utils/validators';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

export default function NotesScreen() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', type: 'note' });

    const fetchNotes = async () => {
        try {
            const { data } = await noteService.list();
            setNotes(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchNotes();
        }, [])
    );

    const handleSave = async () => {
        if (!form.title.trim()) return Alert.alert('Error', 'Title is required');
        try {
            if (editingNote) {
                await noteService.update(editingNote.id, form);
            } else {
                await noteService.create(form);
            }
            setModalVisible(false);
            setEditingNote(null);
            setForm({ title: '', content: '', type: 'note' });
            fetchNotes();
        } catch (err) {
            Alert.alert('Error', 'Failed to save note');
        }
    };

    const handleDelete = (id) => {
        Alert.alert('Delete Note', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    await noteService.remove(id);
                    fetchNotes();
                }
            }
        ]);
    };

    const renderNote = ({ item }) => (
        <TouchableOpacity
            style={styles.noteCard}
            onPress={() => {
                setEditingNote(item);
                setForm({ title: item.title, content: item.content, type: item.type });
                setModalVisible(true);
            }}
        >
            <Text style={styles.noteTitle}>{sanitizeText(item.title)}</Text>
            <Text style={styles.noteSnippet} numberOfLines={2}>{sanitizeText(item.content || 'No content')}</Text>
            <View style={styles.noteFooter}>
                <Text style={styles.noteType}>#{item.type}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteIcon}>🗑</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.heading}>My Notes 📝</Text>
                <TouchableOpacity style={styles.addBtn} onPress={() => { setEditingNote(null); setModalVisible(true); }}>
                    <Text style={styles.addBtnText}>+ New Note</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={notes}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderNote}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.emptyText}>No notes yet. Start writing ideas!</Text>}
                />
            )}

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingNote ? 'Edit Note' : 'New Note'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Title"
                            placeholderTextColor={COLORS.textMuted}
                            value={form.title}
                            onChangeText={v => setForm({ ...form, title: v })}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Start writing..."
                            placeholderTextColor={COLORS.textMuted}
                            multiline
                            value={form.content}
                            onChangeText={v => setForm({ ...form, content: v })}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveBtnText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    header: { padding: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    heading: { fontSize: 26, fontWeight: '800', color: COLORS.textPrimary },
    addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full },
    addBtnText: { color: '#fff', fontWeight: '700' },
    list: { padding: SPACING.lg },
    noteCard: {
        backgroundColor: COLORS.bgCard,
        padding: SPACING.md,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOW.card
    },
    noteTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
    noteSnippet: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12 },
    noteFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    noteType: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
    deleteIcon: { fontSize: 18 },
    emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: 100 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, height: '80%' },
    modalTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.lg },
    input: { backgroundColor: COLORS.bgInput, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    textArea: { height: 300, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg },
    cancelBtn: { flex: 1, padding: SPACING.md, alignItems: 'center' },
    cancelBtnText: { color: COLORS.textMuted, fontWeight: '600' },
    saveBtn: { flex: 2, backgroundColor: COLORS.primary, padding: SPACING.md, alignItems: 'center', borderRadius: RADIUS.md },
    saveBtnText: { color: '#fff', fontWeight: '800' }
});
