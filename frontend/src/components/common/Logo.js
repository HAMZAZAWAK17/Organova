import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export default function Logo({ size = 28, showText = true, color = COLORS.primary }) {
    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.4 }]}>
                <Ionicons name="cube" size={size} color={color} />
            </View>
            {showText && (
                <Text style={[styles.text, { fontSize: size }]}>
                    Organo<Text style={{ color: COLORS.accent }}>va</Text>
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        backgroundColor: COLORS.bgInput,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    text: {
        fontWeight: '900',
        color: COLORS.textPrimary,
        letterSpacing: -1,
    },
});
