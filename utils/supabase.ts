import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// ASENDA NENDE VÄÄRTUSED OMA PROJEKTI OMAdeGA!
// VÕTMED LEIAD: Supabase Dashboard -> Settings -> API
const supabaseUrl = 'https://linpvzdzjnqojqzajnok.supabase.co' 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpbnB2emR6am5xb2pxemFqbm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzkzNjEsImV4cCI6MjA5MjQxNTM2MX0.jLMBO7G3HyRPnhcB7KdHWOTUE9aVCm8CJt47v_cRLYU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})