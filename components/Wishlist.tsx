// components/Wishlist.tsx
import React, { useState, useEffect } from 'react';

import { 
  Alert, 
  FlatList, 
  StyleSheet, 
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Text
} from 'react-native'; 

import { supabase } from '@/utils/supabase'; 
import WishItem from './WishItem'; 

// Eeldame Wish tüübi definitsiooni
interface Wish {
  id: number;
  title: string;
  link?: string;
  description?: string;
  image_url?: string;
  came_true: boolean;
}

export default function Wishlist({ cameTrue }: { cameTrue: boolean }) {
  
  // data olekud
  const [wishes, setWishes] = useState<Wish[]>([]); // Lahendab 'wishes' puudumise
  const [loading, setLoading] = useState(true);

  // data laadimine
  const loadWishes = async () => {
    setLoading(true);
    const { 
      data, 
      error 
    } = await supabase
      .from('wishes')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      Alert.alert("Viga", "Soovide laadimine ebaõnnestus: " + error.message);
    } else {
      setWishes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWishes();
    // Lisame reaalajas uuenduse kuulaja
    const channel = supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            { 
                event: '*', 
                schema: 'public', 
                table: 'wishes' 
            },
            () => loadWishes()
        )
        .subscribe();
        
    return () => {
        supabase.removeChannel(channel);
    };

  }, []);

  // supabase funktsioonid (Käsitsevad WishItem'i nupuvajutusi)
  
// Uuendatud funktsioon: Toggle'b (pöörab ümber) came_true väärtuse
  const handleMarkComplete = async (wishId: number) => {
    // 1. Leia soov andmete hulgast, et näha selle praegust olekut
    const wishToToggle = wishes.find(w => w.id === wishId);
    
    if (!wishToToggle) return; // Kui soovi ei leita, lõpeta
    
    // 2. Arvuta uus olek (vastupidine praegusele)
    const newStatus = !wishToToggle.came_true;

    // 3. Uuenda Supabase'i andmebaasis
    const { error } = await supabase
      .from('wishes')
      // Määra olek vastupidiseks!
      .update({ came_true: newStatus }) 
      .eq('id', wishId);

    if (error) {
      const action = newStatus ? "täidetuks märkimine" : "tagasi 'Actual'-iks muutmine";
      Alert.alert("Viga", `Soovi ${action} ebaõnnestus: ` + error.message);
    } else {
      loadWishes(); 
    }
  };
  
  const handleDeleteWish = async (wishId: number) => {
    // Kustuta soov andmebaasist
    const { error } = await supabase
      .from('wishes')
      .delete()
      .eq('id', wishId);

    if (error) {
      Alert.alert("Viga", "Soovi kustutamine ebaõnnestus: " + error.message);
    } else {
      loadWishes(); 
    }
  };

  
  // Filtreerib soovid vastavalt praegusele vaatele ("Actual" vs "Came true")
  const filteredWishes = wishes.filter((w: Wish) => w.came_true === cameTrue); 

  // laadimise teade
  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Laadimine...</Text>
        </View>
    );
  }
  
  // tühja nimekirja teade
  if (filteredWishes.length === 0) {
      const message = cameTrue
        ? "Sul ei ole veel täitunud soove. Lisa mõni soov!"
        : "Lisa esimene soov, mida sa tõeliselt tahad!";
      return (
          <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{message}</Text>
          </View>
      );
  }

  return (
    <FlatList
      data={filteredWishes}
      numColumns={2}
      keyExtractor={(item) => item.id.toString()}
      // funktsioonid --> WishItem'ile
      renderItem={({ item }) => (
        <WishItem 
          wish={item} 
          onMarkComplete={handleMarkComplete} 
          onDelete={handleDeleteWish} 
        />
      )}
      // Ruudustiku paigutus:
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    // nimekiri
    paddingHorizontal: 5, 
    paddingBottom: 20, 
  },
  columnWrapper: {
    // kaks itemit mahuvad alati ära
    justifyContent: 'space-between',
  },
});