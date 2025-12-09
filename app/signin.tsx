import 'react-native-url-polyfill/auto'; // 1. TÄHTIS: See peab olema kõige esimene rida!
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, Alert, ActivityIndicator } from 'react-native'; 
import { supabase } from '../utils/supabase'; 
import Auth from '../components/Auth'; 
import { Session } from '@supabase/supabase-js';
import PasswordReset from '@/components/PasswordReset';
 

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // See olek hoiab meid "Parooli vahetamise" vaates, isegi kui oleme sisse logitud
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    // 1. Algne kontroll
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true); 
    });

    // 2. Sündmuste kuulaja
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth Event:", event); 

      // Kui Supabase ütleb, et käib parooli taastamine, lülita sisse erirežiim
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
      
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Väljalogimise funktsioon
  async function signOut() {
    await supabase.auth.signOut();
    setRecoveryMode(false);
  }

  // Laadimisvaade
  if (!initialized) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#F5A858" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 1. RECOVERY MODE (Parooli muutmine) */}
      {/* See vaade on eelisjärjekorras, kui recoveryMode on true */}
      {session && recoveryMode ? (
        <PasswordReset 
          initialStep="update" // Ütleme, et alusta kohe parooli muutmisest
          onBack={async () => {
            // KUI VALMIS (või katkestatud):
            // 1. Logi kasutaja välja (et ta peaks uue parooliga sisse logima)
            await supabase.auth.signOut();
            // 2. Lülita välja recovery mode
            setRecoveryMode(false);
          }} 
        />
      ) 
      
      /* 2. TAVALINE SISSELOGITUD OLEK (Avaleht) */
      : session && session.user ? (
        <View style={styles.loggedInContainer}>
          <Text style={styles.welcomeText}>Tere tulemast!</Text>
          <Text style={styles.emailText}>{session.user.email}</Text>
          <View style={styles.signOutButtonContainer}>
              <Button title="Logi välja" onPress={signOut} color="#ef4444" />
          </View>
        </View>
      ) 
      
      /* 3. VÄLJALOGITUD OLEK (Sisselogimine) */
      : (
        <Auth />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', 
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loggedInContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  welcomeText: {
    fontSize: 24, 
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  emailText: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 20,
  },
  signOutButtonContainer: {
    marginTop: 20,
    width: '100%',
    maxWidth: 200,
  }
});