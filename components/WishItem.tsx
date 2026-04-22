import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, Alert, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; // Uus import ikoonide jaoks
import { ThemedButton } from '@/components/themed-button';
import { supabase } from '@/utils/supabase';
import { useNavigation, useRouter } from 'expo-router';

interface Wish {
  id: number;
  title: string;
  link?: string;
  description?: string;
  image_url?: string;
  came_true: boolean;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.46; // Proportsionaalne laius 

interface WishItemProps {
  wish: Wish;
  onMarkComplete: (wishId: number) => Promise<void>; 
  onDelete: (wishId: number) => Promise<void>;
}

export default function WishItem({ wish, onMarkComplete, onDelete }: WishItemProps) {
  const navigation = useNavigation() as any;
  
  // "Linnukese" ikoon, kui soov tehtud
  const completeIconName = wish.came_true ? 'checkmark-circle' : 'ellipse-outline'; 
  const completeIconColor = wish.came_true ? '#ff9800' : '#ff9800'; // Roheline vs Oranž

  const router = useRouter();
// Funktsioon detailvaatesse minekuks
  const handlePress = () => {
router.push({
    pathname: "/wish-details",
    params: { wish: JSON.stringify(wish) } // Expo Routeris on vahel kindlam objekt stringina saata
  });
};

  return (
    <Pressable 
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
      ]}
    >
      {/* Pilt */}
      {wish.image_url ? (
        <Image source={{ uri: wish.image_url }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
             <Feather name="image" size={40} color="#ccc" />
        </View>
      )}
      
      {/* KUSTUTAMISE NUPP - Kasutame Pressable'it ka siin, et vältida bubblingut */}
      <Pressable 
        style={styles.closeButton} 
        onPress={(e) => {
          e.stopPropagation(); // TAKISTAB detailvaate avanemist, kui vajutad X
          onDelete(wish.id);
        }}
      >
        <Feather name='x' size={18} color="#000" /> 
      </Pressable>
      
      {/* INFO KONTEINER */}
      <View style={styles.infoContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{wish.title}</Text>
          
          <Pressable 
            onPress={(e) => {
              e.stopPropagation(); // TAKISTAB detailvaate avanemist
              onMarkComplete(wish.id);
            }}
          >
            <Ionicons name={completeIconName as any} size={28} color="#ff9800" />
          </Pressable>
        </View>
        
        {wish.description && (
          <Text style={styles.description} numberOfLines={2}>
            {wish.description}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: ITEM_WIDTH, 
    marginHorizontal: width * 0.02, 
    marginVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 15, // Ümaramad nurgad teevad modernsemaks
    overflow: 'hidden', 
    elevation: 4, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minHeight: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180, // Annab pildile rohkem ruumi
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: '#f9f9f9', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // --- UUS: INFO KONTEINER ---
  infoContainer: {
    padding: 12,
    backgroundColor: '#fff',
  },
  
  //PEALKIRJA JA NUPU RIDA ---
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1, // Võtab suurema osa ruumist
    fontWeight: '700',
    fontSize: 15,
  lineHeight: 16,
},
  description: {
    fontSize: 12,
    color: '#666',
  },
  
  // --- KUSTUTAMISE NUPP ---
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 10,
  },
  deleteButtonText: {
    fontSize: 18,
    lineHeight: 20,
    color: '#c67c4e',
    fontWeight: '600',
  },
  // --- TEE TEHTUKS IKON-NUPP ---
  completeIcon: {
    padding: 2,
    // Ikoonide suurus on määratud Ionicons prop'is
  }
});