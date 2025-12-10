import 'react-native-url-polyfill/auto'; 
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, ActivityIndicator } from 'react-native'; 
import { supabase } from '@/utils/supabase'; 
import Auth from '@/components/Auth'; 
import PasswordChange from '@/components/PasswordChange'; // UUS IMPORT
import { Session } from '@supabase/supabase-js'; 

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false); // Sundrežiim

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true); 
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Kui Supabase tuvastab parooli taastamise sündmuse
      if (event === 'PASSWORD_RECOVERY') {
        setShowPasswordChange(true);
      }
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowPasswordChange(false);
  };

  if (!initialized) return <View style={styles.center}><ActivityIndicator size="large" color="#F5A858" /></View>;

  return (
    <View style={styles.container}>
      
      {/* 1. PRIORITEET: Parooli muutmise leht */}
      {showPasswordChange ? (
        <PasswordChange onSuccess={handleLogout} />
      ) 
      
      /* 2. PRIORITEET: Tavaline sisselogitud leht */
      : session && session.user ? (
        <View style={styles.center}>
          <Text style={{color: 'white', fontSize: 20}}>Tere tulemast!</Text>
          <Text style={{color: '#ccc', marginBottom: 20}}>{session.user.email}</Text>
          <Button title="Logi välja" onPress={handleLogout} color="#ef4444" />
        </View>
      ) 
      
      /* 3. PRIORITEET: Sisselogimine / Koodi sisestamine */
      : (
        <Auth 
          // See funktsioon käivitab sundrežiimi
          onReadyForPasswordUpdate={() => setShowPasswordChange(true)} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#000000' }
});