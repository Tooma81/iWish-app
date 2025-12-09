import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../utils/supabase';
import { LOGO_SOURCE } from './Auth'; 

type ResetStep = 'request' | 'verify' | 'update';

interface PasswordResetProps {
  onBack: () => void;
  initialStep?: ResetStep; 
}

export default function PasswordReset({ onBack, initialStep = 'request' }: PasswordResetProps) {
  const [step, setStep] = useState<ResetStep>(initialStep);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // --- 1. SAMM: Küsi koodi ---
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
      Alert.alert('Kood saadetud', 'Kontrolli postkasti!');
      setStep('verify');
    }
  };

  // --- 2. SAMM: Kontrolli koodi (8 numbrit) ---
  const verifyResetCode = async () => {
    const cleanToken = token.trim();
    const cleanEmail = email.trim();

    if (cleanToken.length !== 8) {
      Alert.alert('Viga', `Kood peab olema 8 numbrit.`);
      return;
    }
    
    setLoading(true);
    
    // verifyOtp logib kasutaja sisse. 
    // App.tsx püüab selle kinni ja renderdab selle komponendi uuesti 'update' sammus.
    const { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'recovery',
    });
    
    setLoading(false);

    if (error) {
      Alert.alert('Viga', error.message || 'Vale kood.');
    } else {
      // Kui App.tsx ei jõua reageerida piisavalt kiiresti, aitame kaasa
      setStep('update');
    }
  };

  // --- 3. SAMM: Uuenda parool ---
  const updateUserPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Viga', 'Parool peab olema vähemalt 6 tähemärki pikk.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Viga', 'Paroolid ei kattu.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      Alert.alert('Viga', error.message);
    } else {
      Alert.alert(
        'Edukas', 
        'Sinu parool on muudetud! Suuname sind sisselogimisse.', 
        [{ 
          text: 'OK', 
          onPress: () => {
            // See funktsioon käivitab App.tsx sees signOut()
            onBack(); 
          }
        }]
      );
    }
  };

  return (
    <LinearGradient
      colors={['#0D3245', '#115476', '#000000']}
      locations={[0.3, 0.5, 0.9]}
      style={styles.gradientContainer}
    >
      <View style={styles.contentContainer}>
        
        <View style={styles.headerContainer}>
          <Image style={styles.logoImage} source={LOGO_SOURCE} />
          <Text style={styles.headerTitle}>
            {step === 'update' ? 'Set New Password' : 'Reset Password'}
          </Text>
        </View>

        {/* --- 1. EMAIL --- */}
        {step === 'request' && (
          <View>
             <Text style={styles.description}>Enter your email to receive a recovery code.</Text>
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
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bigOrangeButtonText}>Send Code</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* --- 2. KOOD (8-kohaline) --- */}
        {step === 'verify' && (
          <View>
            <Text style={styles.description}>We sent an 8-digit code to {email}</Text>
            <View style={styles.verticallySpaced}>
              <Text style={styles.label}>Code</Text>
              <TextInput
                style={styles.input}
                placeholder="12345678"
                placeholderTextColor="#9b9999ff"
                value={token}
                onChangeText={setToken}
                keyboardType="number-pad"
                maxLength={8}
              />
            </View>
            <TouchableOpacity
              style={[styles.bigOrangeButton, loading && styles.disabledButton]}
              onPress={verifyResetCode}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bigOrangeButtonText}>Verify Code</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* --- 3. UUS PAROOL --- */}
        {step === 'update' && (
          <View>
            <Text style={styles.description}>Create a new strong password.</Text>
            
            <View style={styles.verticallySpaced}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#9b9999ff"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
            </View>
            
            <View style={styles.verticallySpaced}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="********"
                placeholderTextColor="#9b9999ff"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.bigOrangeButton, loading && styles.disabledButton]}
              onPress={updateUserPassword}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.bigOrangeButtonText}>Update Password</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Tagasi nupp (Peidetud 'update' ajal) */}
        {step !== 'update' && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        )}

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1, width: '100%', height: '100%' },
  contentContainer: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'stretch' },
  headerContainer: { alignItems: 'center', marginBottom: 30 },
  logoImage: { width: 100, height: 100, resizeMode: 'contain', marginBottom: 15 },
  headerTitle: { fontSize: 24, color: '#ffffff', fontWeight: 'bold', fontFamily: 'Sora' },
  description: { fontSize: 14, color: '#cccccc', textAlign: 'center', marginBottom: 20 },
  verticallySpaced: { marginBottom: 15, alignSelf: 'center' },
  label: { fontSize: 14, marginBottom: 4, color: '#F5A858', marginLeft: 10 },
  input: { width: 320, height: 50, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#C67C4E', paddingHorizontal: 15, borderRadius: 20, fontSize: 16, color: '#000000' },
  bigOrangeButton: { display: 'flex', borderRadius: 20, height: 45, width: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5a858ff', alignSelf: 'center', marginTop: 10, marginBottom: 20, shadowColor: "#F5A858", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  bigOrangeButtonText: { color: '#ffffffff', fontSize: 16, fontWeight: 'bold', fontFamily: 'Sora' },
  disabledButton: { backgroundColor: '#cc771a', opacity: 0.7 },
  backButton: { alignItems: 'center', marginTop: 10 },
  backButtonText: { color: '#ffffff', textDecorationLine: 'underline', fontSize: 14 }
});