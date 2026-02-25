import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform,
    ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword, validateName } from '../../utils/validators';
import { COLORS, SPACING, RADIUS, FONTS } from '../../constants/theme';
import Logo from '../../components/common/Logo';

export default function RegisterScreen({ navigation }) {
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // ── Frontend validation (OWASP Rule 2) ──────────────────
    function validate() {
        const e = {};
        const nameErr = validateName(form.name);
        if (nameErr) e.name = nameErr;
        if (!validateEmail(form.email)) e.email = 'Enter a valid email address';
        const pwdErrors = validatePassword(form.password);
        if (pwdErrors.length > 0) e.password = pwdErrors.join(', ');
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleRegister() {
        if (!validate()) return;
        setLoading(true);
        try {
            await register(form.name.trim(), form.email.trim().toLowerCase(), form.password);
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <LinearGradient colors={[COLORS.bg, COLORS.bgCard]} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoWrapper}>
                        <Logo size={24} />
                    </View>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Organova today</Text>

                    {/* Name */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={[styles.input, errors.name && styles.inputError]}
                            placeholder="Jane Doe"
                            placeholderTextColor={COLORS.textMuted}
                            value={form.name}
                            onChangeText={(v) => setForm({ ...form, name: v })}
                            autoCapitalize="words"
                            maxLength={100}
                        />
                        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                    </View>

                    {/* Email */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="jane@example.com"
                            placeholderTextColor={COLORS.textMuted}
                            value={form.email}
                            onChangeText={(v) => setForm({ ...form, email: v })}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            maxLength={255}
                        />
                        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                    </View>

                    {/* Password */}
                    <View style={styles.field}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Min 8 chars, uppercase, number, symbol"
                            placeholderTextColor={COLORS.textMuted}
                            value={form.password}
                            onChangeText={(v) => setForm({ ...form, password: v })}
                            secureTextEntry
                            maxLength={128}
                        />
                        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <TouchableOpacity
                        style={[styles.btn, loading && styles.btnDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>Create Account</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
                        <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Sign In</Text></Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1 },
    scroll: { padding: SPACING.lg, paddingTop: SPACING.xxl },
    logoWrapper: { marginBottom: SPACING.md },
    title: { fontSize: 32, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.xs },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: SPACING.xl },
    field: { marginBottom: SPACING.md },
    label: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.xs, fontWeight: '600' },
    input: {
        backgroundColor: COLORS.bgInput,
        borderRadius: RADIUS.md,
        padding: SPACING.md,
        color: COLORS.textPrimary,
        fontSize: 16,
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
    btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    link: { marginTop: SPACING.lg, alignItems: 'center' },
    linkText: { color: COLORS.textSecondary, fontSize: 14 },
    linkBold: { color: COLORS.primary, fontWeight: '700' },
});
