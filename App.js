
import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://uuxwqxhozanzyaamfthl.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_836k-ZpW3Frp16iLQxhkoQ_W_j0VUCo';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export default function App() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function handleAuth() {
    if (!email.trim() || !password) {
      Alert.alert('Заполни поля', 'Введи почту и пароль.');
      return;
    }
    setLoading(true);
    try {
      const result = mode === 'signup'
        ? await supabase.auth.signUp({
            email: email.trim(),
            password
          })
        : await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
          });

      if (result.error) throw result.error;

      if (mode === 'signup' && !result.data.session) {
        Alert.alert(
          'Проверь почту',
          'Если подтверждение email включено, открой письмо от Supabase и подтверди регистрацию.'
        );
      }
    } catch (error) {
      Alert.alert('Не получилось', error.message || 'Попробуй ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert('Ошибка', error.message);
  }

  if (session) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.content}>
          <Text style={styles.logo}>nova<Text style={styles.accent}>.</Text></Text>
          <Text style={styles.title}>Ты в Nova Chat!</Text>
          <Text style={styles.subtitle}>{session.user.email}</Text>
          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Добро пожаловать</Text>
            <Text style={styles.noticeText}>
              Аккаунт работает. Следующим шагом добавим список пользователей и переписку.
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Text style={styles.logoIcon}>N</Text>
            </View>
            <Text style={styles.logo}>nova<Text style={styles.accent}>.</Text></Text>
            <Text style={styles.tagline}>Твоя связь. Твои люди.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>
              {mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Войди, чтобы продолжить общение'
                : 'Присоединяйся к Nova Chat'}
            </Text>

            <Text style={styles.label}>ЭЛЕКТРОННАЯ ПОЧТА</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#73798c"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>ПАРОЛЬ</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Минимум 6 символов"
              placeholderTextColor="#73798c"
              secureTextEntry
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.disabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>
                    {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                  </Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switch}
              onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}
            >
              <Text style={styles.switchText}>
                {mode === 'login'
                  ? 'Нет аккаунта? Зарегистрироваться'
                  : 'Уже есть аккаунт? Войти'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>NOVA CHAT • НА СВЯЗИ</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#0b0d14' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  brand: { alignItems: 'center', marginBottom: 34 },
  logoBox: {
    width: 58, height: 58, borderRadius: 19,
    backgroundColor: '#7567ff', alignItems: 'center',
    justifyContent: 'center', marginBottom: 14
  },
  logoIcon: { color: '#fff', fontSize: 30, fontWeight: '900' },
  logo: { color: '#fff', fontSize: 39, fontWeight: '800', letterSpacing: -1.5 },
  accent: { color: '#8c80ff' },
  tagline: { color: '#9298ab', fontSize: 14, marginTop: 7 },
  card: {
    backgroundColor: '#141722', borderRadius: 25,
    padding: 23, borderWidth: 1, borderColor: '#252a3a'
  },
  title: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#969caf', fontSize: 14, marginBottom: 25 },
  label: {
    color: '#b5bad0', fontSize: 10, fontWeight: '800',
    letterSpacing: 1.3, marginBottom: 9, marginTop: 5
  },
  input: {
    backgroundColor: '#0d1019', borderWidth: 1,
    borderColor: '#2b3042', borderRadius: 13,
    paddingHorizontal: 15, paddingVertical: 15,
    color: '#fff', fontSize: 15, marginBottom: 18
  },
  button: {
    backgroundColor: '#7567ff', borderRadius: 13,
    padding: 16, alignItems: 'center', marginTop: 8
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  switch: { paddingVertical: 18, alignItems: 'center' },
  switchText: { color: '#a69cff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  footer: {
    color: '#50566b', fontSize: 10, letterSpacing: 2,
    textAlign: 'center', marginTop: 25
  },
  notice: {
    backgroundColor: '#141722', borderRadius: 18,
    borderWidth: 1, borderColor: '#292d40', padding: 20, marginVertical: 25
  },
  noticeTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  noticeText: { color: '#a5abc0', fontSize: 14, lineHeight: 21 }
});
