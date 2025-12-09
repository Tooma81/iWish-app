import 'react-native-url-polyfill/auto'; // 1. TÄHTIS: See peab olema kõige esimene rida!
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Button, Alert, ActivityIndicator } from 'react-native'; 
import { supabase } from '../utils/supabase'; 
import Auth from '../components/Auth'; 
import { Session } from '@supabase/supabase-js'; 

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  // 2. UUS: Olek, et teada, kas Supabase on algse kontrolli lõpetanud
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // 1. Kontrolli seansi olekut käivitamisel
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitialized(true); // Märgime, et oleme kontrolliga valmis
    });

    // 2. Seadista reaalajas kuulaja olekumuutustele
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    // Puhasta kuulaja komponendi eemaldamisel
    return () => subscription.unsubscribe();
  }, []);

  // Väljalogimise funktsioon
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        Alert.alert("Väljalogimise viga", error.message);
    }
  }

  // 3. UUS: Kui äpp alles käivitub ja kontrollib sisselogimist, näita laadimisringi
  if (!initialized) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Kui seanss on olemas, kuva sisselogitud sisu */}
      {session && session.user ? (
        <View style={styles.loggedInContainer}>
          <Text style={styles.welcomeText}>
            Tere tulemast, {session.user.email}! (Sisselogitud)
          </Text>
          
          {/* Väljalogimise nupp */}
          <View style={styles.signOutButtonContainer}>
              <Button 
                title="Logi välja" 
                onPress={signOut} 
                color="#ef4444" // Punane nupp
              />
          </View>

        </View>
      ) : (
        // Kui seanssi pole, kuva autentimise vorm (mis sisaldab nüüd ka parooli taastamist)
        <Auth />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // Eemaldasin siit 'justifyContent' ja 'alignItems', et Auth komponent saaks ise ruumi hallata
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
  },
  welcomeText: {
    fontSize: 20, 
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  signOutButtonContainer: {
    marginTop: 20,
    width: '100%',
    maxWidth: 200,
  }
});