<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import logoImg from '@/assets/las-delicias-logo.png'
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserPlusIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const { signIn, signUp, loading } = useAuth()

const isSignUpMode = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

async function handleSubmit() {
  errorMessage.value = null
  successMessage.value = null

  if (!email.value || !password.value) {
    errorMessage.value = 'Por favor ingresa tu correo y contraseña.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'La contraseña debe tener al menos 6 caracteres.'
    return
  }

  try {
    if (isSignUpMode.value) {
      const res = await signUp(email.value, password.value)
      if (res.user && !res.session) {
        successMessage.value = '¡Cuenta creada! Revisa tu correo para confirmar o inicia sesión.'
        isSignUpMode.value = false
        return
      }
      successMessage.value = '¡Cuenta de administrador creada con éxito!'
    } else {
      await signIn(email.value, password.value)
    }

    // Redirect to requested path or admin dashboard
    const redirectPath = (route.query.redirect as string) || '/admin'
    router.push(redirectPath)
  } catch (err: any) {
    console.error('Auth error:', err)
    if (err.message?.includes('Invalid login credentials') || err.code === 'invalid_credentials') {
      errorMessage.value = 'Correo electrónico o contraseña incorrectos.'
    } else if (err.message?.includes('Email not confirmed')) {
      errorMessage.value = 'El correo no ha sido confirmado aún.'
    } else if (err.message?.includes('User already registered')) {
      errorMessage.value = 'Este correo ya está registrado. Por favor inicia sesión.'
    } else {
      errorMessage.value = err.message || 'Error al autenticar con el servidor.'
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
    <!-- Ambient background glow effects -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Back to public menu button -->
    <div class="w-full max-w-md mb-4 flex justify-between items-center z-10">
      <router-link
        to="/"
        class="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700/80"
      >
        <ArrowLeftIcon class="w-4 h-4" />
        <span>Ir a la Carta Pública</span>
      </router-link>

      <span class="text-[11px] font-mono text-slate-500 bg-slate-800/50 px-2 py-1 rounded-lg border border-slate-700/50">
        Supabase Auth 🔐
      </span>
    </div>

    <!-- Main Auth Card -->
    <div class="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <div class="inline-block p-2 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-inner mb-1">
          <img :src="logoImg" alt="Las Delicias Restobar" class="h-12 w-auto object-contain mx-auto" />
        </div>

        <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">
          {{ isSignUpMode ? 'Registro de Administrador' : 'Acceso al Panel Admin' }}
        </h1>
        <p class="text-xs text-slate-400">
          {{ isSignUpMode
            ? 'Crea tu usuario para gestionar cartas, productos y promociones.'
            : 'Ingresa tus credenciales seguras para administrar el sistema.' }}
        </p>
      </div>

      <!-- Alerts -->
      <div
        v-if="errorMessage"
        class="p-3 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 text-xs flex items-center gap-2.5 animate-shake"
      >
        <ExclamationCircleIcon class="w-5 h-5 text-red-400 shrink-0" />
        <span class="leading-snug">{{ errorMessage }}</span>
      </div>

      <div
        v-if="successMessage"
        class="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 text-xs flex items-center gap-2.5"
      >
        <SparklesIcon class="w-5 h-5 text-emerald-400 shrink-0" />
        <span class="leading-snug">{{ successMessage }}</span>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Email -->
        <div class="space-y-1.5">
          <label class="block text-xs font-semibold text-slate-300">
            Correo Electrónico
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <EnvelopeIcon class="w-4 h-4" />
            </div>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="admin@lasdelicias.com"
              class="input input-sm w-full pl-10 pr-3 rounded-xl bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 text-xs focus:border-brand-primary focus:outline-hidden min-h-[42px]"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-semibold text-slate-300">
              Contraseña
            </label>
            <span class="text-[10px] text-slate-400">Mínimo 6 caracteres</span>
          </div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <LockClosedIcon class="w-4 h-4" />
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="input input-sm w-full pl-10 pr-10 rounded-xl bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-500 text-xs focus:border-brand-primary focus:outline-hidden min-h-[42px]"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <component :is="showPassword ? EyeSlashIcon : EyeIcon" class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="loading"
          class="btn w-full bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg min-h-[44px] cursor-pointer mt-2"
        >
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          <component v-else :is="isSignUpMode ? UserPlusIcon : ShieldCheckIcon" class="w-4 h-4" />
          <span>{{ loading ? 'Verificando con Supabase...' : isSignUpMode ? 'Crear Cuenta Administrador' : 'Iniciar Sesión' }}</span>
        </button>
      </form>

      <!-- Toggle mode between login and signup for first-time admin setup -->
      <div class="pt-2 border-t border-slate-700/60 text-center space-y-2">
        <button
          type="button"
          @click="isSignUpMode = !isSignUpMode; errorMessage = null; successMessage = null"
          class="text-xs text-brand-primary hover:text-orange-400 transition-colors font-medium cursor-pointer"
        >
          {{ isSignUpMode
            ? '¿Ya tienes una cuenta creada? Iniciar sesión'
            : '¿Es tu primera vez? Crear cuenta de administrador' }}
        </button>

        <div class="text-[11px] text-slate-500">
          Autenticación segura respaldada por Supabase Auth & Row Level Security (RLS).
        </div>
      </div>
    </div>
  </div>
</template>
