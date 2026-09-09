<script setup lang="ts">
import { ref } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  PhoneIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

const props = withDefaults(defineProps<{
  sourceMenu?: 'main' | 'bar'
}>(), {
  sourceMenu: 'main'
})

const { config, subscribeToWhatsApp } = useMenuStore()

const name = ref('')
const phone = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const isSubmitted = ref(false)
const isDuplicate = ref(false)
const registeredName = ref('')
const targetGroupUrl = ref('')

async function handleSubmit() {
  errorMessage.value = null
  const cleanPhone = phone.value.replace(/\D/g, '')

  if (!cleanPhone || cleanPhone.length < 8) {
    errorMessage.value = 'Por favor ingresa un número de celular de al menos 9 dígitos.'
    return
  }

  isLoading.value = true
  try {
    const res = await subscribeToWhatsApp({
      name: name.value,
      phone: cleanPhone,
      source_menu: props.sourceMenu
    })

    registeredName.value = name.value.trim()
    targetGroupUrl.value = res.groupUrl || config.value.whatsapp_group_url || 'https://chat.whatsapp.com/FLX38a7Z4lC4b6EXAMPLE'
    isDuplicate.value = res.alreadyRegistered
    isSubmitted.value = true
  } catch (err: any) {
    errorMessage.value = err.message || 'Ocurrió un error al procesar tu solicitud.'
  } finally {
    isLoading.value = false
  }
}

function openGroupLink() {
  const url = targetGroupUrl.value || config.value.whatsapp_group_url || 'https://chat.whatsapp.com/FLX38a7Z4lC4b6EXAMPLE'
  window.open(url, '_blank')
}

function resetForm() {
  name.value = ''
  phone.value = ''
  isSubmitted.value = false
  isDuplicate.value = false
  errorMessage.value = null
}
</script>

<template>
  <!-- Only render if feature is enabled in admin settings -->
  <section
    v-if="config.whatsapp_subscription_enabled !== false"
    class="my-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
  >
    <!-- Header banner with clean brand styling -->
    <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-5 text-white relative">
      <div class="flex items-start gap-3.5 relative z-10">
        <div class="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 mt-0.5 shadow-inner">
          <ChatBubbleLeftRightIcon class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-extrabold text-white tracking-tight flex items-center gap-1.5">
            <span>📲 Entérate de nuestras promociones y novedades</span>
          </h3>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed max-w-md">
            Únete a nuestro grupo de WhatsApp y recibe información sobre promociones, eventos, nuevos platos y novedades de Las Delicias Restobar.
          </p>
        </div>
      </div>
    </div>

    <!-- Post-submission State (Confirmation + Direct Group Invitation) -->
    <div v-if="isSubmitted" class="p-5 sm:p-6 text-center space-y-4 bg-emerald-50/40">
      <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
        <CheckCircleIcon class="w-7 h-7" />
      </div>

      <div class="space-y-1.5 max-w-md mx-auto">
        <h4 class="font-extrabold text-slate-900 text-base sm:text-lg">
          {{ isDuplicate
            ? '¡Este número ya estaba registrado!'
            : `🎉 ¡Gracias por registrarte${registeredName ? ', ' + registeredName : ''}!`
          }}
        </h4>
        <p class="text-xs text-slate-600 leading-relaxed">
          {{ isDuplicate
            ? 'Este número ya está registrado. Puedes unirte a nuestro grupo de WhatsApp para recibir nuestras novedades.'
            : 'Ahora únete a nuestro grupo de WhatsApp para recibir promociones, novedades y eventos de Las Delicias Restobar.'
          }}
        </p>
      </div>

      <!-- Action Button: Open Public Group Invitation Link -->
      <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <button
          type="button"
          @click="openGroupLink"
          class="btn bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 px-6 shadow-md cursor-pointer w-full sm:w-auto"
        >
          <ChatBubbleLeftRightIcon class="w-4 h-4" />
          <span>Unirme al grupo de WhatsApp</span>
          <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          @click="resetForm"
          class="btn btn-ghost text-slate-500 hover:text-slate-800 rounded-xl text-xs"
        >
          Registrar otro número
        </button>
      </div>
    </div>

    <!-- Clean Input Form -->
    <form v-else @submit.prevent="handleSubmit" class="p-4 sm:p-5 space-y-3.5">
      <!-- Error notification -->
      <div
        v-if="errorMessage"
        class="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
      >
        <ExclamationCircleIcon class="w-4 h-4 shrink-0 text-red-500" />
        <span>{{ errorMessage }}</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Name field -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Nombre <span class="text-slate-400 font-normal">(opcional)</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <UserIcon class="w-4 h-4" />
            </div>
            <input
              v-model="name"
              type="text"
              placeholder="Ej. Juan Pérez"
              maxlength="80"
              class="input input-sm w-full pl-9 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-brand-primary text-xs"
            />
          </div>
        </div>

        <!-- WhatsApp Phone field -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">
            Número de WhatsApp <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <PhoneIcon class="w-4 h-4" />
            </div>
            <input
              v-model="phone"
              type="tel"
              placeholder="Ej. 987 654 321"
              required
              maxlength="15"
              class="input input-sm w-full pl-9 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-brand-primary text-xs font-mono font-medium"
            />
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <div class="flex items-center justify-between pt-1">
        <div class="inline-flex items-center gap-1 text-[10px] text-slate-400">
          <SparklesIcon class="w-3.5 h-3.5 text-emerald-500" />
          <span>Acceso libre al grupo de novedades</span>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer px-5"
        >
          <span v-if="isLoading" class="loading loading-spinner loading-xs"></span>
          <span>{{ isLoading ? 'Registrando...' : 'Quiero recibir novedades' }}</span>
        </button>
      </div>
    </form>
  </section>
</template>
