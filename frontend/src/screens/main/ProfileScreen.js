import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services';
import { validateName, validatePassword } from '../../utils/validators';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [nameErr, setNameErr] = useState('');
    const [saving, setSaving] = useState(false);

    const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
    const [pwdErr, setPwdErr] = useState({});
    const [pwdSaving, setPwdSaving] = useState(false);

    async function handleSaveName() {
        const err = validateName(name);
        if (err) { setNameErr(err); return; }
        setNameErr('');
        setSaving(true);
        try {
            await userService.updateProfile({ name: name.trim() });
            Alert.alert('Success', 'Profile updated');
        } catch {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    }

    async function handleChangePassword() {
        const e = {};
        if (!pwdForm.current) e.current = 'Required';
        const pwdErrors = validatePassword(pwdForm.next);
        if (pwdErrors.length > 0) e.next = pwdErrors.join(', ');
        if (pwdForm.next !== pwdForm.confirm) e.confirm = 'Passwords do not match';
        setPwdErr(e);
        if (Object.keys(e).length > 0) return;

        setPwdSaving(true);
        try {
            await userService.changePassword({ current_password: pwdForm.current, new_password: pwdForm.next });
            Alert.alert('Success', 'Password changed');
            setPwdForm({ current: '', next: '', confirm: '' });
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to change password');
        } finally {
            setPwdSaving(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.heading}>Profile</Text>

                {/* Avatar */}
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{(user?.name || 'U')[0].toUpperCase()}</Text>
                </View>
                <Text style={styles.email}>{user?.email}</Text>
                <Text style={styles.role}>{user?.role}</Text>

                {/* Update Name */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Update Name</Text>
                    <TextInput
                        style={[styles.input, nameErr && styles.inputError]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Full name"
                        placeholderTextColor={COLORS.textMuted}
                        maxLength={100}
                    />
                    {nameErr ? <Text style={styles.errorText}>{nameErr}</Text> : null}
                    <TouchableOpacity style={[styles.btn, saving && styles.btnDisabled]} onPress={handleSaveName} disabled={saving}>
                        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Name</Text>}
                    </TouchableOpacity>
                </View>

                {/* Change Password */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Change Password</Text>
                    {[
                        { key: 'current', label: 'Current Password' },
                        { key: 'next', label: 'New Password' },
                        { key: 'confirm', label: 'Confirm New Password' },
                    ].map(({ key, label }) => (
                        <View key={key}>
                            <Text style={styles.label}>{label}</Text>
                            <TextInput
                                style={[styles.input, pwdErr[key] && styles.inputError]}
                                value={pwdForm[key]}
                                onChangeText={(v) => setPwdForm({ ...pwdForm, [key]: v })}
                                secureTextEntry
                                maxLength={128}
                                placeholder={label}
                                placeholderTextColor={COLORS.textMuted}
                            />
                            {pwdErr[key] && <Text style={styles.errorText}>{pwdErr[key]}</Text>}
                        </View>
                    ))}
                    <TouchableOpacity
                        style={[styles.btn, pwdSaving && styles.btnDisabled]}
                        onPress={handleChangePassword}
                        disabled={pwdSaving}
                    >
                        {pwdSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Change Password</Text>}
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: SPACING.lg, alignItems: 'center' },
    heading: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, alignSelf: 'flex-start', marginBottom: SPACING.lg },
    avatar: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
    email: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 4 },
    role: { fontSize: 12, color: COLORS.primary, fontWeight: '700', textTransform: 'uppercase', marginBottom: SPACING.xl },
    section: { width: '100%', marginBottom: SPACING.xl },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.md },
    label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4, marginTop: SPACING.sm },
    input: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        color: COLORS.textPrimary,
        fontSize: 15,
        borderWidth: 1,
        borderColor: COLORS.border,
        width: '100%',
    },
    inputError: { borderColor: COLORS.error },
    errorText: { color: COLORS.error, fontSize: 12, marginTop: 4 },
    btn: {
        backgroundColor: COLORS.primary,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        marginTop: SPACING.md,
    },
    btnDisabled: { opacity: 0.6 },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    logoutBtn: {
        width: '100%',
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    logoutText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
});
