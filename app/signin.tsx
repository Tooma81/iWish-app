import 'react-native-url-polyfill/auto'; 
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, ActivityIndicator } from 'react-native'; 
import { supabase } from '@/utils/supabase'; 
import Auth from '@/components/Auth';
import PasswordReset from '@/components/PasswordReset'; 
import { Session } from '@supabase/supabase-js'; // Veendu, et see on imporditud

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [initialized, setInitialized] = useState(false);
  
  // See olek sunnib äppi näitama parooli vahetamise vaadet
  const [forceUpdateMode, setForceUpdateMode] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true); 
    });

    // --- PARANDUS SIIN ALL ---
    // Lisasime ': Session | null', et TypeScript ei kurdaks
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      console.log("App Event:", _event); 
      
      if (_event === 'PASSWORD_RECOVERY') {
        setForceUpdateMode(true);
      }

      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Funktsioon, mis kutsutakse pärast edukat paroolivahetust
  async function handlePasswordUpdated() {
    console.log("Parool vahetatud. Login välja.");
    await supabase.auth.signOut(); 
    setForceUpdateMode(false);     
  }

  async function signOut() {
    await supabase.auth.signOut();
    setForceUpdateMode(false);
  }

  if (!initialized) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#F5A858" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 1. SUNDREŽIIM: Parooli vahetamine */}
      {forceUpdateMode ? (
        <PasswordReset 
          initialStep="update" 
          onBack={handlePasswordUpdated} 
        />
      ) 
      
      /* 2. TAVALINE SISSELOGITUD OLEK */
      : session && session.user ? (
        <View style={styles.loggedInContainer}>
          <Text style={styles.welcomeText}>Tere tulemast!</Text>
          <Text style={styles.emailText}>{session.user.email}</Text>
          <View style={styles.signOutButtonContainer}>
             <Button title="Logi välja" onPress={signOut} color="#ef4444" />
          </View>
        </View>
      ) 
      
      /* 3. VÄLJALOGITUD OLEK */
      : (
        <Auth 
          onReadyForPasswordUpdate={() => {
            console.log("Lülitan sisse parooli vahetamise režiimi");
            setForceUpdateMode(true);
          }} 
        />
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