// components/WishItem.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const HORIZONTAL_MARGIN = 5; 
const NUM_COLUMNS = 2;

const ITEM_WIDTH = width / 2 - 15; // 2 veergu, jättes natuke vahet

interface Wish {
  id: number;
  title: string;
  image_url: string | null;
  came_true: boolean;
}

export default function WishItem({ wish }: { wish: Wish }) {
  // Kasutame pildi URL-i, kui see on olemas
  const source = wish.image_url 
    ? { uri: wish.image_url } 
    : require('@/assets/splash.png'); // Asendage see oma vaikimisi pildiga

  return (
    <View style={styles.card}>
      <Image 
        source={source} 
        style={styles.image} 
        resizeMode="cover" 
      />
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>{wish.title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginVertical: 5,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3, // Android vari
    shadowColor: '#000', // iOS vari
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: ITEM_WIDTH, // Teeb pildi ruudukujuliseks
    backgroundColor: '#f0f0f0',
  },
  titleContainer: {
    padding: 10,
    backgroundColor: '#fcfcfc',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});