import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, KeyboardAvoidingView, Platform,
    ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validators';
import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
    const { login } = useAuth();
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    function validate() {
        const e = {};
        if (!validateEmail(form.email)) e.email = 'Enter a valid email';
        if (!form.password) e.password = 'Password is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleLogin() {
        if (!validate()) return;
        setLoading(true);
        try {
            await login(form.email.trim().toLowerCase(), form.password);
        } catch (err) {
            // Generic message to prevent user enumeration (OWASP A07)
            Alert.alert('Error', 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    }

    return (
        <LinearGradient colors={[COLORS.bg, COLORS.bgCard]} style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
                <View style={styles.content}>
                    <Text style={styles.logo}>⬡ Organova</Text>
                    <Text style={styles.title}>Welcome back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>

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

                    <View style={styles.field}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={[styles.input, errors.password && styles.inputError]}
                            placeholder="Your password"
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
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading
                            ? <ActivityIndicator color="#fff" />
                            : <Text style={styles.btnText}>Sign In</Text>
                        }
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
                        <Text style={styles.linkText}>No account? <Text style={styles.linkBold}>Create one</Text></Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, justifyContent: 'center' },
    content: { padding: SPACING.lg },
    logo: { fontSize: 28, fontWeight: '900', color: COLORS.primary, marginBottom: SPACING.xl },
    title: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs },
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
