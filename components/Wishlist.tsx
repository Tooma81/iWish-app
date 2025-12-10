// components/Wishlist.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { supabase } from '@/utils/supabase';
import WishItem from './WishItem';

interface Wish {
  id: number;
  title: string;
  image_url: string | null;
  came_true: boolean;
}

interface WishlistProps {
  cameTrue: boolean;
}

export default function Wishlist({ cameTrue }: WishlistProps) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishes = async () => {
    setLoading(true);
    
    // Hankige praeguse kasutaja ID
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
        setError("Kasutaja pole sisse logitud.");
        setLoading(false);
        return;
    }
    
    // Andmete pärimine (Select)
    const { data, error } = await supabase
      .from('wishes')
      .select('id, title, image_url, came_true')
      .eq('user_id', user.id) // Filter: Ainult praeguse kasutaja soovid
      .eq('came_true', cameTrue) // Filter: 'Actual' (false) või 'Came true' (true)
      .order('created_at', { ascending: false }); // Sorteerimine uuemad ees

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setWishes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWishes();

    // Reaalaja kuulaja seadistamine (valikuline: tagab kohese uuenduse pärast salvestamist)
    const channel = supabase
      .channel('wishes_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'wishes' }, payload => {
        // Kontrollime, kas muudatus vastab praegusele vaatele
        if (payload.new.came_true === cameTrue) {
             // Kui uus kirje on lisatud, laadi andmed uuesti
            fetchWishes(); 
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [cameTrue]);


  if (loading) {
    return <ActivityIndicator size="large" color="#C67C4E" style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>Viga andmete laadimisel: {error}</Text>;
  }

  // Ruudustiku stiil FlatList abil (numColumns={2})
  return (
    <FlatList
      data={wishes}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <WishItem wish={item} />}
      numColumns={2} // <-- Ruudustiku (grid) kuvamine
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.columnWrapper}
      ListEmptyComponent={<Text style={styles.emptyText}>Soove pole lisatud.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  loader: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  errorText: { 
    color: 'red', 
    textAlign: 'center', 
    marginTop: 20 
  },
  listContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    paddingBottom: 20,
    flex: 1,
  },
  columnWrapper: {
    // tagab vahed veergude vahel
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 16,
  }
});