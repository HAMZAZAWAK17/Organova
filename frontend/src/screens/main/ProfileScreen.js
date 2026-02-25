import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services';
import { validateName, validatePassword } from '../../utils/validators';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function ProfileScreen() {
    const { user, logout, updateUser } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [nameErr, setNameErr] = useState('');
    const [saving, setSaving] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

    const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
    const [pwdErr, setPwdErr] = useState({});
    const [pwdSaving, setPwdSaving] = useState(false);

    async function pickImage() {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            handleUpdateAvatar(result.assets[0].uri);
        }
    }

    async function handleUpdateAvatar(uri) {
        setSaving(true);
        try {
            // NOTE: In a real app, you'd upload URI to S3/Cloudinary and get a URL back.
            // For this demo, we'll just save the local URI (though it won't persist across devices).
            await userService.updateProfile({ name: name.trim(), avatar_url: uri });
            updateUser({ avatar_url: uri });
            setAvatarUrl(uri);
        } catch (err) {
            Alert.alert('Error', 'Failed to update avatar');
        } finally {
            setSaving(false);
        }
    }

    async function handleSaveName() {
        const err = validateName(name);
        if (err) { setNameErr(err); return; }
        setNameErr('');
        setSaving(true);
        try {
            await userService.updateProfile({ name: name.trim(), avatar_url: avatarUrl });
            // ── Update user in AuthContext so UI reflects new name everywhere ──
            updateUser({ name: name.trim(), avatar_url: avatarUrl });
            Alert.alert('Success', 'Profile updated');
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to update profile');
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
            await userService.changePassword({
                current_password: pwdForm.current,
                new_password: pwdForm.next,
            });
            Alert.alert('Success', 'Password changed successfully');
            setPwdForm({ current: '', next: '', confirm: '' });
        } catch (err) {
            Alert.alert('Error', err.response?.data?.error || 'Failed to change password');
        } finally {
            setPwdSaving(false);
        }
    }

    const initials = (user?.name || 'U')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.heading}>Profile</Text>

                {/* Avatar */}
                <View style={styles.avatarWrapper}>
                    <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                        {avatarUrl ? (
                            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatarPlaceholder}>
                                <Text style={styles.avatarText}>{initials}</Text>
                            </View>
                        )}
                        <View style={styles.editBadge}>
                            <Ionicons name="camera" size={16} color="#fff" />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.displayName}>{user?.name}</Text>
                    <Text style={styles.email}>{user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                    </View>
                </View>

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
                        autoCapitalize="words"
                    />
                    {nameErr ? <Text style={styles.errorText}>{nameErr}</Text> : null}
                    <TouchableOpacity
                        style={[styles.btn, saving && styles.btnDisabled]}
                        onPress={handleSaveName}
                        disabled={saving}
                    >
                        {saving
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>Save Name</Text>
                        }
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
                        <View key={key} style={styles.fieldGap}>
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
                        {pwdSaving
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>Change Password</Text>
                        }
                    </TouchableOpacity>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                    <Text style={styles.logoutText}>🔓  Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    scroll: { padding: SPACING.lg, paddingBottom: SPACING.xxl },
    heading: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.lg },

    // Avatar section
    avatarWrapper: { alignItems: 'center', marginBottom: SPACING.xl },
    avatarContainer: { position: 'relative', marginBottom: SPACING.sm },
    avatarPlaceholder: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: COLORS.primary,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 3, borderColor: COLORS.bgCard
    },
    avatarImage: {
        width: 100, height: 100, borderRadius: 50,
        borderWidth: 3, borderColor: COLORS.bgCard
    },
    editBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: COLORS.primary,
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: COLORS.bgCard
    },
    avatarText: { fontSize: 36, fontWeight: '800', color: '#fff' },
    displayName: { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
    email: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    roleBadge: {
        backgroundColor: COLORS.primary + '22',
        borderRadius: RADIUS.full,
        paddingHorizontal: SPACING.md,
        paddingVertical: 4,
    },
    roleText: { fontSize: 11, color: COLORS.primary, fontWeight: '800', letterSpacing: 1 },

    // Sections
    section: { width: '100%', marginBottom: SPACING.xl },
    sectionTitle: {
        fontSize: 18, fontWeight: '700', color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        borderLeftWidth: 3, borderLeftColor: COLORS.primary,
        paddingLeft: SPACING.sm,
    },
    fieldGap: { marginBottom: SPACING.sm },
    label: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
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
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.error,
        backgroundColor: COLORS.error + '11',
    },
    logoutText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
});
