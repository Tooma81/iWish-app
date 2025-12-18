import React, { useMemo } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View, StyleSheet, Dimensions, Alert, useColorScheme, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import Feather from '@expo/vector-icons/Feather';
import { useLocalSearchParams, useRouter } from 'expo-router';

const { height } = Dimensions.get("window");

export default function WishDetails() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? Colors.dark : Colors.light;

    const wish = useMemo(() => {
        try {
            return params.wish ? JSON.parse(params.wish as string) : null;
        } catch (e) {
            return null;
        }
    }, [params.wish]);

    const onOpenLink = () => {
        if (wish?.link) Linking.openURL(wish.link);
        else Alert.alert("Link puudub");
    };

    // Funktsioon, mis viib sõprade valimise vaatesse
    const handleShareToFriend = () => {
        router.push({
            pathname: "/friends", // Sinu sõprade nimekirja teekond
            params: { 
                action: "share_wish", 
                wishData: JSON.stringify(wish) 
            }
        });
    };

    if (!wish) return <Text>Andmed puuduvad</Text>;

    return (
        <SafeAreaView style={[styles.save, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
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
                    {/* PEALKIRI JA LINK KÕRVUTI */}
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: theme.text }]}>{wish.title}</Text>
                        {wish.link && (
                            <Pressable onPress={onOpenLink} style={styles.linkCircle}>
                                <Feather name="link-2" size={20} color="#C67C4E" />
                            </Pressable>
                        )}
                    </View>

                    <Text style={[styles.description, { color: theme.text }]}>
                        {wish.description || "Kirjeldust ei ole lisatud."}
                    </Text>
                </View>

                {/* ALUMINE NUPPUDE RIDA */}
                <View style={styles.footer}>
                    <Pressable 
                        style={styles.shareIconBtn} 
                        onPress={handleShareToFriend}
                    >
                        <Feather name="upload" size={24} color="#C67C4E" />
                    </Pressable>

                    <Pressable 
                        style={[styles.fulfillBtn, { backgroundColor: wish.came_true ? '#ccc' : '#F5A858' }]}
                        onPress={() => Alert.alert("Märgi tehtuks funktsioon")}
                    >
                        <Text style={styles.fulfillBtnText}>
                            {wish.came_true ? "Märgi tegemata" : "Täida soov"}
                        </Text>
                    </Pressable>
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
        flex: 1,
        padding: 24,
    },
    titleRow: { 
        flexDirection: "row", 
        alignItems: "center", 
        marginBottom: 20 
    },
    title: { fontSize: 28, fontWeight: "bold", flex: 1 },
    linkCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FDEEE3',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    description: { fontSize: 16, lineHeight: 24, color: '#666' },
    footer: {
        flexDirection: 'row',
        padding: 20,
        paddingBottom: 40,
        alignItems: 'center',
        gap: 15,
    },
    shareIconBtn: {
        width: 55,
        height: 55,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#C67C4E',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fulfillBtn: {
        flex: 1,
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
    },
    fulfillBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});