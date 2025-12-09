import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import gradienti jaoks
import { supabase } from '../utils/supabase';

interface PasswordResetProps {
  onBack: () => void;
}

type ResetStep = 'request' | 'verify' | 'update';

export default function PasswordReset({ onBack }: PasswordResetProps) {
  const [step, setStep] = useState<ResetStep>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. SAMM: Saada taastamise kood
  const sendResetCode = async () => {
    if (!email) {
      Alert.alert('Viga', 'Palun sisesta e-posti aadress.');
      return;
    }
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);

    if (error) {
      Alert.alert('Viga', error.message);
    } else {
      Alert.alert('Kood saadetud', 'Kontrolli oma e-posti ja kopeeri sealt kood.');
      setStep('verify');
    }
  };

  // 2. SAMM: Kontrolli koodi
  const verifyResetCode = async () => {
    if (!token || token.length < 6) {
      Alert.alert('Viga', 'Palun sisesta korrektne kood.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery',
    });

    setLoading(false);

    if (error) {
      Alert.alert('Viga', 'Vale kood või kood on aegunud.');
    } else {
      setStep('update');
    }
  };

  // 3. SAMM: Uuenda parool
  const updateUserPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Viga', 'Parool peab olema vähemalt 6 tähemärki pikk.');
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    setLoading(false);

    if (error) {
      Alert.alert('Viga', error.message);
    } else {
      Alert.alert('Edukas', 'Sinu parool on muudetud. Palun logi uuesti sisse.', [
        { text: 'OK', onPress: () => onBack() }
      ]);
    }
  };

  return (
    <LinearGradient
      colors={['#0D3245', '#115476', '#000000']}
      locations={[0.3, 0.5, 0.9]}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        
        <Text style={styles.header}>Taasta parool</Text>

        {/* --- 1. SAMM: E-posti sisestamine --- */}
        {step === 'request' && (
          <View>
            <Text style={styles.description}>
              Sisesta oma e-posti aadress, et saada kinnituskood.
            </Text>
            
            <View style={styles.verticallySpaced}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                placeholderTextColor="#9b9999ff"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity 
              style={[styles.bigOrangeButton, loading && styles.disabledButton]} 
              onPress={sendResetCode} 
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.bigOrangeButtonText}>Saada kood</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* --- 2. SAMM: Koodi sisestamine --- */}
        {step === 'verify' && (
          <View>
            <Text style={styles.description}>
              Sisesta 6-kohaline kood, mis saadeti aadressile {email}.
            </Text>

            <View style={styles.verticallySpaced}>
              <Text style={styles.label}>Kood</Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor="#9b9999ff"
                value={token}
                onChangeText={setToken}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity 
              style={[styles.bigOrangeButton, loading && styles.disabledButton]} 
              onPress={verifyResetCode} 
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.bigOrangeButtonText}>Kinnita kood</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('request')} style={styles.linkButton}>
              <Text style={styles.linkText}>Saada kood uuesti</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- 3. SAMM: Uue parooli määramine --- */}
        {step === 'update' && (
          <View>
            <Text style={styles.description}>
              Sisesta uus turvaline parool.
            </Text>

            <View style={styles.verticallySpaced}>
              <Text style={styles.label}>Uus parool</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#9b9999ff"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.bigOrangeButton, loading && styles.disabledButton]} 
              onPress={updateUserPassword} 
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.bigOrangeButtonText}>Salvesta parool</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Tagasi nupp */}
        {step !== 'update' && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Tagasi sisselogimisse</Text>
          </TouchableOpacity>
        )}

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#ffffff', // Valge tekst tumedal taustal
    fontFamily: 'Sora', // Kui kasutasid fonti
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 30,
    textAlign: 'center',
  },
  
  // --- Inputi stiilid (kopeeritud AuthFormist) ---
  verticallySpaced: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#F5A858', // Oranž silt
    marginLeft: 10
  },
  input: {
    width: 320,
    height: 50,
    backgroundColor: '#ffffff',
    borderWidth: 1, 
    borderColor: '#C67C4E',
    paddingHorizontal: 15,
    borderRadius: 20,
    fontSize: 16,
    color: '#000000',
  },

  // --- Nupu stiilid (kopeeritud AuthFormist) ---
  bigOrangeButton: {
    display: 'flex',
    borderRadius: 20,
    height: 40,
    width: 180,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5a858ff',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  bigOrangeButtonText: {
    color: '#ffffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Sora',
  },
  disabledButton: {
    backgroundColor: '#cc771a',
    opacity: 0.7,
  },

  // --- Linkide stiilid ---
  linkButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: '#ffffff',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  backButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#cccccc',
    fontSize: 14,
  }
});