import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { taskService, noteService, eventService } from '../../services';
import { sanitizeText } from '../../utils/validators';
import { COLORS, SPACING, RADIUS, SHADOW } from '../../constants/theme';

export default function CalendarScreen({ navigation }) {
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [modalVisible, setModalVisible] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', color: COLORS.accent });
    const [creating, setCreating] = useState(false);

    const fetchData = async () => {
        try {
            const [tasksRes, notesRes, eventsRes] = await Promise.all([
                taskService.list({ limit: 1000 }),
                noteService.list(),
                eventService.list()
            ]);
            setTasks(tasksRes.data.data || []);
            setNotes(notesRes.data || []);
            setEvents(eventsRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const handleCreateEvent = async () => {
        if (!newEvent.title.trim()) return Alert.alert('Error', 'Title is required');
        setCreating(true);
        try {
            await eventService.create({
                ...newEvent,
                start_date: selectedDate + ' 09:00:00',
            });
            setModalVisible(false);
            setNewEvent({ title: '', description: '', color: COLORS.accent });
            fetchData();
        } catch (err) {
            Alert.alert('Error', 'Failed to create event');
        } finally {
            setCreating(false);
        }
    };

    const markedDates = useMemo(() => {
        const marks = {};

        tasks.forEach(task => {
            if (task.due_date) {
                const date = task.due_date.split('T')[0];
                marks[date] = {
                    marked: true,
                    dotColor: COLORS.primary,
                    selected: date === selectedDate,
                    selectedColor: date === selectedDate ? COLORS.primary + '33' : undefined
                };
            }
        });

        notes.forEach(note => {
            if (note.created_at) {
                const date = note.created_at.split('T')[0];
                if (!marks[date]) {
                    marks[date] = { marked: true, dotColor: COLORS.success, selected: date === selectedDate };
                } else {
                    marks[date].dotColor = COLORS.warning; // Mixed
                }
            }
        });

        events.forEach(event => {
            if (event.start_date) {
                const date = event.start_date.split('T')[0];
                if (!marks[date]) {
                    marks[date] = { marked: true, dotColor: event.color || COLORS.accent, selected: date === selectedDate };
                } else {
                    marks[date].dotColor = COLORS.warning; // Mixed
                }
            }
        });

        // Ensure selected date is highlighted even if no events
        if (!marks[selectedDate]) {
            marks[selectedDate] = { selected: true, selectedColor: COLORS.primary };
        } else {
            marks[selectedDate].selected = true;
            marks[selectedDate].selectedColor = COLORS.primary;
        }

        return marks;
    }, [tasks, notes, selectedDate]);

    const dayEvents = useMemo(() => {
        const filteredTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(selectedDate));
        const filteredNotes = notes.filter(n => n.created_at && n.created_at.startsWith(selectedDate));
        const filteredEvents = events.filter(e => e.start_date && e.start_date.startsWith(selectedDate));

        return [
            ...filteredTasks.map(t => ({ ...t, eventType: 'task' })),
            ...filteredNotes.map(n => ({ ...n, eventType: 'note' })),
            ...filteredEvents.map(e => ({ ...e, eventType: 'event' }))
        ];
    }, [tasks, notes, events, selectedDate]);

    const renderEvent = ({ item }) => {
        let icon = 'ellipse';
        let color = COLORS.primary;
        if (item.eventType === 'task') { icon = 'checkbox-outline'; color = COLORS.primary; }
        else if (item.eventType === 'note') { icon = 'document-text-outline'; color = COLORS.success; }
        else if (item.eventType === 'event') { icon = 'calendar-outline'; color = item.color || COLORS.accent; }

        return (
            <TouchableOpacity
                style={styles.eventCard}
                onPress={() => {
                    if (item.eventType === 'task') navigation.navigate('TaskDetail', { taskId: item.id });
                }}
            >
                <View style={[styles.eventTypeIndicator, { backgroundColor: color }]} />
                <View style={styles.eventInfo}>
                    <View style={styles.eventHeader}>
                        <Ionicons name={icon} size={16} color={COLORS.textSecondary} />
                        <Text style={styles.eventTitle} numberOfLines={1}>{sanitizeText(item.title)}</Text>
                    </View>
                    {(item.description || item.content) ? (
                        <Text style={styles.eventDesc} numberOfLines={1}>
                            {sanitizeText(item.description || item.content)}
                        </Text>
                    ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={COLORS.border} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Calendar
                theme={{
                    backgroundColor: COLORS.bg,
                    calendarBackground: COLORS.bg,
                    textSectionTitleColor: COLORS.textMuted,
                    selectedDayBackgroundColor: COLORS.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: COLORS.primary,
                    dayTextColor: COLORS.textPrimary,
                    textDisabledColor: COLORS.border,
                    dotColor: COLORS.primary,
                    selectedDotColor: '#ffffff',
                    arrowColor: COLORS.primary,
                    monthTextColor: COLORS.textPrimary,
                    indicatorColor: COLORS.primary,
                    textDayFontWeight: '500',
                    textMonthFontWeight: '800',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 14,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 12
                }}
                onDayPress={day => setSelectedDate(day.dateString)}
                markedDates={markedDates}
            />

            <View style={styles.eventsContainer}>
                <View style={styles.eventsHeader}>
                    <Text style={styles.eventsHeading}>Events for {selectedDate}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{dayEvents.length}</Text>
                    </View>
                    <TouchableOpacity style={styles.miniAddBtn} onPress={() => setModalVisible(true)}>
                        <Ionicons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={dayEvents}
                        keyExtractor={(item, index) => `${item.eventType}-${item.id}-${index}`}
                        renderItem={renderEvent}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Ionicons name="calendar-clear-outline" size={48} color={COLORS.border} />
                                <Text style={styles.emptyText}>No tasks or notes for this day</Text>
                            </View>
                        }
                    />
                )}
            </View>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>New Event for {selectedDate}</Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Event Title"
                            placeholderTextColor={COLORS.textMuted}
                            value={newEvent.title}
                            onChangeText={v => setNewEvent({ ...newEvent, title: v })}
                        />
                        <TextInput
                            style={[styles.modalInput, { height: 80 }]}
                            placeholder="Description"
                            placeholderTextColor={COLORS.textMuted}
                            multiline
                            value={newEvent.description}
                            onChangeText={v => setNewEvent({ ...newEvent, description: v })}
                        />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.createBtn, creating && { opacity: 0.6 }]}
                                onPress={handleCreateEvent}
                                disabled={creating}
                            >
                                {creating ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.createBtnText}>Add Event</Text>}
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
    eventsContainer: { flex: 1, backgroundColor: COLORS.bgCard, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOW.card },
    eventsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SPACING.lg },
    eventsHeading: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
    badge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
    list: { paddingBottom: SPACING.xl },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.bg,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border
    },
    eventTypeIndicator: { width: 4, height: 30, borderRadius: 2, marginRight: SPACING.md },
    eventInfo: { flex: 1 },
    eventHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
    eventTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
    eventDesc: { fontSize: 13, color: COLORS.textSecondary },
    empty: { alignItems: 'center', marginTop: 40, gap: 8 },
    emptyText: { color: COLORS.textMuted, fontSize: 14 },

    // Modal
    miniAddBtn: { backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: SPACING.xl },
    modalContent: { backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, padding: SPACING.xl, ...SHADOW.card },
    modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.lg },
    modalInput: { backgroundColor: COLORS.bg, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.textPrimary, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
    modalBtns: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
    cancelBtn: { flex: 1, padding: SPACING.md, alignItems: 'center' },
    cancelBtnText: { color: COLORS.textMuted, fontWeight: '600' },
    createBtn: { flex: 2, backgroundColor: COLORS.primary, padding: SPACING.md, borderRadius: RADIUS.md, alignItems: 'center' },
    createBtnText: { color: '#fff', fontWeight: '700' },
});
