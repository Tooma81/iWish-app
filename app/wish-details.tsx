import React, { useMemo } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View, StyleSheet, Dimensions, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { height } = Dimensions.get("window");

export default function WishDetails() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const scheme = useColorScheme();
    
    // PARANDUS: Defineerime theme muutuja
    const theme = scheme === 'dark' ? Colors.dark : Colors.light;

    // Turvaline andmete parsimine
    const wish = useMemo(() => {
        try {
            return params.wish ? JSON.parse(params.wish as string) : null;
        } catch (e) {
            console.error("Parsimise viga:", e);
            return null;
        }
    }, [params.wish]);

    // PARANDUS: Defineerime onOpenLink funktsiooni
    const onOpenLink = () => {
        if (wish?.link) {
            Linking.openURL(wish.link);
        } else {
            Alert.alert("Viga", "Link puudub või on vigane");
        }
    };

    if (!wish) {
        return (
            <SafeAreaView style={[styles.save, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.text }}>Andmed puuduvad</Text>
                <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: '#C67C4E' }}>Tagasi</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.save, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image
                        style={styles.image}
                        source={{ uri: wish.image_url || "https://placehold.co/600x400" }}
                        resizeMode="cover"
                    />
                    <Pressable onPress={() => router.back()} style={styles.backContainer}>
                        <Feather name="chevron-left" size={28} color="#000" />
                    </Pressable>
                </View>

                <View style={[styles.content, { backgroundColor: theme.background }]}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: theme.text }]}>{wish.title}</Text>
                        {wish.link ? (
                            <Pressable onPress={onOpenLink} style={styles.linkIconContainer}>
                                <Feather name="external-link" size={24} color="#C67C4E" />
                            </Pressable>
                        ) : null}
                    </View>

                    <Text style={styles.label}>Kirjeldus:</Text>
                    <Text style={[styles.description, { color: theme.text }]}>
                        {wish.description || "Kirjeldust ei ole lisatud."}
                    </Text>

                    {wish.link ? (
                        <>
                            <Text style={styles.label}>Link:</Text>
                            <Pressable onPress={onOpenLink}>
                                <Text style={styles.linkText} numberOfLines={1}>{wish.link}</Text>
                            </Pressable>
                        </>
                    ) : null}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    save: { flex: 1 },
    imageContainer: { position: 'relative' },
    image: { width: "100%", height: height * 0.45 },
    backContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        padding: 8,
    },
    content: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        marginTop: -25,
        padding: 24,
        minHeight: 400,
    },
    titleRow: { 
        flexDirection: "row", 
        justifyContent: 'space-between', 
        alignItems: "center", 
        marginBottom: 20 
    },
    title: { fontSize: 28, fontWeight: "bold" },
    label: { fontSize: 14, color: '#F5A858', fontWeight: 'bold', marginTop: 15, marginBottom: 5 },
    description: { fontSize: 16, lineHeight: 24 },
    linkIconContainer: { padding: 5 },
    linkText: { color: '#C67C4E', textDecorationLine: 'underline', fontSize: 14 },
});