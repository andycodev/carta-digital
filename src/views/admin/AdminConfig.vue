<script setup lang="ts">
import { ref } from 'vue'
import { useMenuStore } from '@/composables/useMenuStore'
import {
  MusicalNoteIcon,
  PlayIcon,
  StopIcon,
  BuildingStorefrontIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,
  TagIcon
} from '@heroicons/vue/24/outline'

const { config, updateConfig, restoreDefaults } = useMenuStore()

const audioPreviewRef = ref<HTMLAudioElement | null>(null)
const isTestingAudio = ref(false)
const savedNotice = ref<string | null>(null)

// Curated royalty-free ambient background streams
const presetTracks = [
  {
    name: 'Lofi Chill Vibes (Recomendado)',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
  },
  {
    name: 'Café Lounge Acústico',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=coffee-chill-out-15283.mp3'
  },
  {
    name: 'Jazz Lounge Suave',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8b9d8858e.mp3?filename=smooth-waters-115977.mp3'
  }
]

function handleSave() {
  updateConfig({
    nombre_negocio: config.value.nombre_negocio,
    subtitulo: config.value.subtitulo,
    musica_activa: config.value.musica_activa,
    musica_url: config.value.musica_url,
    musica_volumen: config.value.musica_volumen,
    telefono_whatsapp: config.value.telefono_whatsapp,
    whatsapp_group_url: config.value.whatsapp_group_url,
    whatsapp_subscription_enabled: config.value.whatsapp_subscription_enabled,
    mostrar_precios_carta: config.value.mostrar_precios_carta,
    mostrar_precios_flyers: config.value.mostrar_precios_flyers
  })

  savedNotice.value = 'Configuración guardada correctamente.'
  setTimeout(() => {
    savedNotice.value = null
  }, 3000)
}

function selectPreset(url: string) {
  config.value.musica_url = url
  handleSave()
}

function toggleAudioTest() {
  if (!audioPreviewRef.value) return

  if (isTestingAudio.value) {
    audioPreviewRef.value.pause()
    isTestingAudio.value = false
  } else {
    audioPreviewRef.value.volume = (config.value.musica_volumen || 35) / 100
    audioPreviewRef.value.play().then(() => {
      isTestingAudio.value = true
    }).catch(err => {
      console.warn('Audio test blocked:', err)
    })
  }
}

function handleFactoryReset() {
  if (confirm('¿Deseas restaurar todas las cartas, productos y configuración a los valores iniciales de Las Delicias Restobar?')) {
    restoreDefaults()
    alert('Se han restaurado todos los datos a sus valores iniciales.')
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-slate-900">Configuración General y Música</h2>
        <p class="text-xs text-slate-500">
          Ajusta la música ambiental para los clientes y los parámetros principales del negocio.
        </p>
      </div>

      <div v-if="savedNotice" class="inline-flex items-center gap-1.5 badge bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-3 py-2 font-medium">
        <CheckCircleIcon class="w-4 h-4 text-emerald-600" />
        <span>{{ savedNotice }}</span>
      </div>
    </div>

    <!-- Hidden audio element for preview -->
    <audio ref="audioPreviewRef" :src="config.musica_url" @ended="isTestingAudio = false"></audio>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <!-- Section 1: Música Ambiental -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-brand-primary">
              <MusicalNoteIcon class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Música Ambiental</h3>
              <p class="text-[11px] text-slate-500">Botón interactivo en la carta pública</p>
            </div>
          </div>

          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-xs font-semibold" :class="config.musica_activa ? 'text-emerald-600' : 'text-slate-400'">
              {{ config.musica_activa ? 'Habilitada' : 'Desactivada' }}
            </span>
            <input
              type="checkbox"
              v-model="config.musica_activa"
              @change="handleSave"
              class="toggle toggle-sm toggle-success"
            />
          </label>
        </div>

        <!-- Presets -->
        <div class="space-y-2">
          <label class="block font-semibold text-slate-700 text-xs">Pistas Ambientales Recomendadas</label>
          <div class="space-y-1.5">
            <button
              v-for="track in presetTracks"
              :key="track.url"
              type="button"
              @click="selectPreset(track.url)"
              class="w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-colors"
              :class="config.musica_url === track.url ? 'bg-amber-50/70 border-amber-300 text-amber-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'"
            >
              <span>{{ track.name }}</span>
              <span v-if="config.musica_url === track.url" class="text-amber-700 font-bold text-[10px]">Seleccionada</span>
            </button>
          </div>
        </div>

        <!-- Custom Audio URL -->
        <div class="space-y-1">
          <label class="block font-semibold text-slate-700 text-xs">URL del Archivo de Audio (MP3 / Stream)</label>
          <input
            v-model="config.musica_url"
            type="url"
            placeholder="https://..."
            @change="handleSave"
            class="input input-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary"
          />
        </div>

        <!-- Volume Slider -->
        <div class="space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-1 font-semibold text-slate-700">
              <SpeakerWaveIcon class="w-3.5 h-3.5 text-slate-400" />
              <span>Volumen Inicial Recomendado</span>
            </span>
            <span class="font-mono text-slate-600">{{ config.musica_volumen }}%</span>
          </div>
          <input
            v-model="config.musica_volumen"
            type="range"
            min="5"
            max="100"
            step="5"
            @change="handleSave"
            class="range range-xs range-primary"
          />
        </div>

        <!-- Test Audio Button -->
        <div class="pt-2 flex items-center gap-2">
          <button
            type="button"
            @click="toggleAudioTest"
            class="btn btn-xs btn-outline border-slate-300 text-slate-700 hover:bg-slate-900 hover:text-white rounded-lg text-xs flex items-center gap-1.5"
          >
            <component :is="isTestingAudio ? StopIcon : PlayIcon" class="w-3.5 h-3.5" />
            <span>{{ isTestingAudio ? 'Detener Prueba de Audio' : 'Probar Reproducción' }}</span>
          </button>
        </div>
      </div>

      <!-- Section 2: Datos del Negocio & Factory Reset -->
      <div class="space-y-5">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <h3 class="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
            <BuildingStorefrontIcon class="w-4 h-4 text-brand-primary" />
            <span>Identidad del Negocio</span>
          </h3>

          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1">Nombre Comercial</label>
            <input
              v-model="config.nombre_negocio"
              type="text"
              @change="handleSave"
              class="input input-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary font-medium"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1">Subtítulo / Eslogan</label>
            <input
              v-model="config.subtitulo"
              type="text"
              @change="handleSave"
              class="input input-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary"
            />
          </div>

          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1">Teléfono / WhatsApp de Pedidos</label>
            <input
              v-model="config.telefono_whatsapp"
              type="text"
              placeholder="+51 999 999 999"
              @change="handleSave"
              class="input input-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary"
            />
          </div>

          <button
            type="button"
            @click="handleSave"
            class="btn btn-sm bg-brand-primary hover:bg-brand-primary-hover text-white border-none rounded-xl text-xs w-full"
          >
            Guardar Cambios
          </button>
        </div>

        <!-- Section 3: Comunidad & Grupo de WhatsApp -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <ChatBubbleLeftRightIcon class="w-4 h-4" />
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-sm">Comunidad & Club WhatsApp</h3>
                <p class="text-[10px] text-slate-500">Suscripción voluntaria de clientes</p>
              </div>
            </div>

            <label class="flex items-center gap-1.5 cursor-pointer">
              <span class="text-[11px] font-semibold" :class="config.whatsapp_subscription_enabled ? 'text-emerald-600' : 'text-slate-400'">
                {{ config.whatsapp_subscription_enabled ? 'Activa' : 'Pausada' }}
              </span>
              <input
                type="checkbox"
                v-model="config.whatsapp_subscription_enabled"
                @change="handleSave"
                class="toggle toggle-xs toggle-success"
              />
            </label>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 text-xs mb-1">
              Enlace de Invitación al Grupo Oficial de WhatsApp
            </label>
            <input
              v-model="config.whatsapp_group_url"
              type="url"
              placeholder="https://chat.whatsapp.com/..."
              @change="handleSave"
              class="input input-sm w-full bg-slate-50 border-slate-200 rounded-xl text-xs focus:bg-white focus:border-brand-primary font-mono"
            />
            <p class="text-[10px] text-slate-400 mt-1">
              Los clientes que se registren serán dirigidos directamente a este enlace para unirse al grupo voluntariamente.
            </p>
          </div>

          <button
            type="button"
            @click="handleSave"
            class="btn btn-sm bg-slate-900 hover:bg-black text-white border-none rounded-xl text-xs w-full"
          >
            Guardar Configuración de WhatsApp
          </button>
        </div>

        <!-- Section 4: Control de Visibilidad de Precios -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
          <div class="flex items-center gap-2 pb-2 border-b border-slate-100">
            <div class="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <TagIcon class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-bold text-slate-900 text-sm">Visibilidad de Precios</h3>
              <p class="text-[10px] text-slate-500">Muestra u oculta precios en cartas y flyers</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p class="font-semibold text-slate-800 text-xs">Precios en Cartas Públicas</p>
                <p class="text-[10px] text-slate-500">Visible para clientes al abrir el menú en su celular</p>
              </div>
              <label class="cursor-pointer">
                <input
                  type="checkbox"
                  v-model="config.mostrar_precios_carta"
                  @change="handleSave"
                  class="toggle toggle-xs toggle-primary"
                />
              </label>
            </div>

            <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <p class="font-semibold text-slate-800 text-xs">Precios en Flyers Descargables</p>
                <p class="text-[10px] text-slate-500">Activado por defecto en la generación de imágenes</p>
              </div>
              <label class="cursor-pointer">
                <input
                  type="checkbox"
                  v-model="config.mostrar_precios_flyers"
                  @change="handleSave"
                  class="toggle toggle-xs toggle-primary"
                />
              </label>
            </div>
          </div>
        </div>

        <!-- Danger Zone: Factory Reset -->
        <div class="bg-white p-5 rounded-2xl border border-red-200 shadow-2xs space-y-2">
          <h3 class="font-bold text-red-700 text-xs uppercase tracking-wider">Zona de Mantenimiento</h3>
          <p class="text-[11px] text-slate-500">
            Restaura las cartas (Desayuno, Almuerzo, Cena, Bar), productos y configuración de demostración a su estado inicial.
          </p>
          <button
            type="button"
            @click="handleFactoryReset"
            class="btn btn-xs btn-outline btn-error rounded-lg text-xs flex items-center gap-1"
          >
            <ArrowPathIcon class="w-3.5 h-3.5" />
            <span>Restaurar Valores de Fábrica</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
