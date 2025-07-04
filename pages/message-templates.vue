<template>
  <div>
    <h2 class="text-3xl font-bold text-text-primary mb-6">Mesaj Şablonları Yönetimi</h2>

    <div class="bg-card rounded-lg shadow-lg overflow-hidden transition-all border border-border-color hover:border-primary hover:scale-[1.005] relative">
      <LoadingOverlay :isLoading="isLoading" message="Şablonlar yükleniyor..." />
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-text-primary">Şablonlar</h3>
          <button @click="openCreateModal" :disabled="isProcessing" class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Yeni Şablon Oluştur
          </button>
        </div>
        <div class="overflow-x-auto" :class="{'min-h-[200px]': isLoading}"> <!-- Add min-height to prevent layout shift -->
          <table class="w-full text-left">
            <thead class="border-b border-border-color">
              <tr>
                <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Ad</th>
                <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Açıklama</th>
                <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Kanal</th>
                <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Konu</th>
                <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Aksiyonlar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!isLoading && messageTemplates.length === 0">
                <td colspan="5" class="p-4 text-center text-text-secondary">Henüz mesaj şablonu bulunmamaktadır.</td>
              </tr>
              <tr v-else v-for="template in messageTemplates" :key="template.id" class="border-b border-border-color hover:bg-background/50 transition-colors relative">
                <LoadingOverlay :isLoading="isDeletingTemplateId === template.id" message="Siliniyor..." />
                <td class="p-4 text-text-primary font-medium">{{ template.name }}</td>
                <td class="p-4 text-text-secondary text-sm truncate max-w-xs" :title="template.description">{{ template.description || '-' }}</td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs font-bold rounded" :class="getChannelClass(template.channel)">
                    {{ template.channel }}
                  </span>
                </td>
                <td class="p-4 text-text-primary text-sm truncate max-w-xs" :title="template.subject">{{ template.subject || '-' }}</td>
                <td class="p-4 flex items-center gap-4">
                  <button @click="openEditModal(template)" :disabled="isProcessing" class="text-yellow-400 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    Düzenle
                  </button>
                  <button @click="openDeleteConfirmation(template)" :disabled="isProcessing" class="text-red-500 hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    Sil
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ClientOnly>
      <MessageTemplateModal
        v-if="showModal"
        :template-to-edit="templateToEdit"
        @close="closeModal"
        @create-template="handleTemplateCreated"
        @update-template="handleTemplateUpdated"
        :key="modalKey"
        :is-processing="isProcessing"
      />

      <ConfirmationModal
        :show="showDeleteConfirmationModal"
        title="Şablonu Sil"
        message="Bu mesaj şablonunu kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirm-text="Sil"
        confirm-button-class="bg-red-600 hover:bg-red-700"
        :is-confirming="isProcessing"
        @confirm="confirmDelete"
        @close="closeDeleteConfirmationModal"
      />

      <NotificationToast
        :show="notification.show"
        :type="notification.type"
        :message="notification.message"
        @close="hideNotification"
      />
    </ClientOnly>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import MessageTemplateModal from '~/components/MessageTemplateModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import LoadingOverlay from '~/components/LoadingOverlay.vue'
import NotificationToast from '~/components/NotificationToast.vue'

// Enum değerleri (C# enum'larına göre manuel olarak tanımlandı)
const MessageChannelEnum = {
  Email: 'Email',
  SMS: 'SMS',
  PushNotification: 'PushNotification',
  InApp: 'InApp',
  Webhook: 'Webhook'
}

const messageTemplates = ref([])
const isLoading = ref(true) // Sayfa yükleme durumu
const isProcessing = ref(false) // CRUD işlemleri için genel yükleme durumu
const isDeletingTemplateId = ref(null) // Belirli bir şablonun silinirken yükleme durumu

const notification = ref({
  show: false,
  type: '', // 'success', 'error', 'info'
  message: ''
})

const showNotification = (type, message) => {
  notification.value = { show: true, type, message }
  setTimeout(() => {
    hideNotification()
  }, 3000) // 3 saniye sonra bildirimi gizle
}

const hideNotification = () => {
  notification.value = { show: false, type: '', message: '' }
}

// Örnek şablon verileri
const sampleMessageTemplates = [
  {
    id: 'mt1',
    dataType: 'Project',
    name: 'Welcome Email',
    description: 'New user welcome email template',
    body: '<p>Welcome to our service, <strong>{{userName}}</strong>!</p><p>We are glad to have you.</p>',
    channel: MessageChannelEnum.Email,
    subject: 'Welcome to Our Platform!'
  },
  {
    id: 'mt2',
    dataType: 'Project',
    name: 'Order Confirmation SMS',
    description: 'SMS for order confirmation',
    body: 'Your order {{orderId}} has been confirmed. Total: {{totalAmount}}.',
    channel: MessageChannelEnum.SMS,
    subject: null
  },
  {
    id: 'mt3',
    dataType: 'Project',
    name: 'Password Reset Notification',
    description: 'In-app notification for password reset',
    body: '<p>Your password has been successfully reset. If you did not initiate this, please contact support immediately.</p>',
    channel: MessageChannelEnum.InApp,
    subject: 'Password Reset Successful'
  }
]

const showModal = ref(false)
const templateToEdit = ref(null)
const showDeleteConfirmationModal = ref(false)
const templateToDelete = ref(null)

const modalKey = computed(() => {
  if (!showModal.value) return 'closed';
  return templateToEdit.value ? `edit-${templateToEdit.value.id}` : 'create';
});

// Verileri yükleme fonksiyonu
const fetchMessageTemplates = async () => {
  isLoading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 700)) // 700ms gecikme simülasyonu
    messageTemplates.value = sampleMessageTemplates
    showNotification('success', 'Mesaj şablonları başarıyla yüklendi.')
  } catch (error) {
    console.error('Mesaj şablonları yüklenirken hata:', error)
    showNotification('error', 'Mesaj şablonları yüklenirken bir hata oluştu.')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  templateToEdit.value = null
  showModal.value = true
}

const openEditModal = (template) => {
  templateToEdit.value = template
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  templateToEdit.value = null
}

const handleTemplateCreated = async (newTemplateData) => {
  isProcessing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simüle edilmiş API çağrısı
    const newTemplate = {
      ...newTemplateData,
      id: uuidv4(),
      dataType: 'Project'
    }
    messageTemplates.value.unshift(newTemplate)
    showNotification('success', 'Şablon başarıyla oluşturuldu!')
    closeModal()
  } catch (error) {
    console.error('Şablon oluşturma hatası:', error)
    showNotification('error', 'Şablon oluşturulurken bir hata oluştu.')
  } finally {
    isProcessing.value = false
  }
}

const handleTemplateUpdated = async (updatedTemplateData) => {
  isProcessing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simüle edilmiş API çağrısı
    const index = messageTemplates.value.findIndex(t => t.id === updatedTemplateData.id)
    if (index !== -1) {
      messageTemplates.value[index] = { ...messageTemplates.value[index], ...updatedTemplateData }
      showNotification('success', 'Şablon başarıyla güncellendi!')
    } else {
      showNotification('error', 'Güncellenecek şablon bulunamadı.')
    }
    closeModal()
  } catch (error) {
    console.error('Şablon güncelleme hatası:', error)
    showNotification('error', 'Şablon güncellenirken bir hata oluştu.')
  } finally {
    isProcessing.value = false
  }
}

const openDeleteConfirmation = (template) => {
  templateToDelete.value = template
  showDeleteConfirmationModal.value = true
}

const confirmDelete = async () => {
  isProcessing.value = true
  isDeletingTemplateId.value = templateToDelete.value.id // Set loading for specific row
  try {
    await new Promise(resolve => setTimeout(resolve, 700)) // Simüle edilmiş API çağrısı
    const initialLength = messageTemplates.value.length
    messageTemplates.value = messageTemplates.value.filter(t => t.id !== templateToDelete.value.id)
    if (messageTemplates.value.length < initialLength) {
      showNotification('success', 'Şablon başarıyla silindi!')
    } else {
      showNotification('error', 'Şablon bulunamadı veya silinemedi.')
    }
    closeDeleteConfirmationModal()
  } catch (error) {
    console.error('Şablon silme hatası:', error)
    showNotification('error', 'Şablon silinirken bir hata oluştu.')
  } finally {
    isProcessing.value = false
    isDeletingTemplateId.value = null
  }
}

const closeDeleteConfirmationModal = () => {
  showDeleteConfirmationModal.value = false
  templateToDelete.value = null
}

const getChannelClass = (channel) => {
  switch (channel) {
    case MessageChannelEnum.Email: return 'bg-blue-500/20 text-blue-400'
    case MessageChannelEnum.SMS: return 'bg-green-500/20 text-green-400'
    case MessageChannelEnum.PushNotification: return 'bg-purple-500/20 text-purple-400'
    case MessageChannelEnum.InApp: return 'bg-yellow-500/20 text-yellow-400'
    case MessageChannelEnum.Webhook: return 'bg-red-500/20 text-red-400'
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

onMounted(() => {
  fetchMessageTemplates() // Sayfa yüklendiğinde şablonları getir
})
</script>
