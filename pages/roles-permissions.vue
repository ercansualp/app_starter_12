<template>
  <div>
    <h2 class="text-3xl font-bold text-text-primary mb-6">Rol ve İzin Yönetimi</h2>

    <div class="space-y-8">
      <!-- Roles Management Card -->
      <div class="bg-card rounded-lg shadow-md border border-border-color overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 transform hover:scale-[1.005] relative">
        <LoadingOverlay :isLoading="isLoadingRoles" message="Roller yükleniyor..." />
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-text-primary">Roller</h3>
            <button @click="openCreateRoleModal" class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Yeni Rol Oluştur
            </button>
          </div>
          
          <div class="overflow-x-auto" :class="{'min-h-[200px]': isLoadingRoles}">
            <table class="w-full text-left">
              <thead class="border-b border-border-color">
                <tr>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Rol Adı</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Açıklama</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">İzin Sayısı</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Kullanıcı Sayısı</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Durum</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!isLoadingRoles && roles.length === 0">
                  <td colspan="6" class="p-4 text-center text-text-secondary">Henüz rol bulunmamaktadır.</td>
                </tr>
                <tr v-else v-for="role in roles" :key="role.id" class="border-b border-border-color hover:bg-background/50 transition-colors">
                  <td class="p-4 text-text-primary font-medium">{{ role.name }}</td>
                  <td class="p-4 text-text-secondary text-sm">{{ role.description || '-' }}</td>
                  <td class="p-4 text-text-primary">{{ role.permissions.length }}</td>
                  <td class="p-4 text-text-primary">{{ role.userCount || 0 }}</td>
                  <td class="p-4">
                    <StatusBadge :type="role.isActive ? 'active' : 'inactive'" />
                  </td>
                  <td class="p-4 flex items-center gap-3">
                    <button @click="openEditRoleModal(role)" class="text-yellow-600 dark:text-yellow-400 hover:underline text-sm font-medium">
                      Düzenle
                    </button>
                    <button @click="openRolePermissionsModal(role)" class="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium">
                      İzinler
                    </button>
                    <button v-if="!role.isSystemRole" @click="openDeleteRoleConfirmation(role)" class="text-red-600 dark:text-red-400 hover:underline text-sm font-medium">
                      Sil
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Permissions Management Card -->
      <div class="bg-card rounded-lg shadow-md border border-border-color overflow-hidden hover:shadow-lg hover:border-primary transition-all duration-300 transform hover:scale-[1.005] relative">
        <LoadingOverlay :isLoading="isLoadingPermissions" message="İzinler yükleniyor..." />
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-text-primary">İzinler</h3>
            <button @click="openCreatePermissionModal" class="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-500 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Yeni İzin Oluştur
            </button>
          </div>

          <div class="mb-4 flex gap-4 flex-col sm:flex-row">
            <select v-model="selectedCategory" class="px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200">
              <option value="">Tüm Kategoriler</option>
              <option v-for="category in permissionCategories" :key="category" :value="category">{{ category }}</option>
            </select>
            <input
              type="text"
              v-model="permissionFilter"
              placeholder="İzin adına göre filtrele..."
              class="flex-grow px-4 py-2 border border-border-color rounded-lg bg-input-bg text-text-primary placeholder-text-secondary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
            />
          </div>
          
          <div class="overflow-x-auto" :class="{'min-h-[200px]': isLoadingPermissions}">
            <table class="w-full text-left">
              <thead class="border-b border-border-color">
                <tr>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">İzin Adı</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Kategori</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Açıklama</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Rol Sayısı</th>
                  <th class="p-4 text-sm font-semibold text-text-secondary uppercase">Aksiyonlar</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!isLoadingPermissions && filteredPermissions.length === 0">
                  <td colspan="5" class="p-4 text-center text-text-secondary">Filtreye uygun izin bulunmamaktadır.</td>
                </tr>
                <tr v-else v-for="permission in paginatedPermissions" :key="permission.id" class="border-b border-border-color hover:bg-background/50 transition-colors">
                  <td class="p-4 text-text-primary font-medium">{{ permission.name }}</td>
                  <td class="p-4">
                    <span class="px-2 py-1 text-xs font-bold rounded" :class="getCategoryClass(permission.category)">
                      {{ permission.category }}
                    </span>
                  </td>
                  <td class="p-4 text-text-secondary text-sm">{{ permission.description || '-' }}</td>
                  <td class="p-4 text-text-primary">{{ getRoleCountForPermission(permission.id) }}</td>
                  <td class="p-4 flex items-center gap-3">
                    <button @click="openEditPermissionModal(permission)" class="text-yellow-600 dark:text-yellow-400 hover:underline text-sm font-medium">
                      Düzenle
                    </button>
                    <button v-if="!permission.isSystemPermission" @click="openDeletePermissionConfirmation(permission)" class="text-red-600 dark:text-red-400 hover:underline text-sm font-medium">
                      Sil
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Pagination
            v-model:currentPage="permissionsCurrentPage"
            :total-pages="permissionsTotalPages"
            class="mt-4"
          />
        </div>
      </div>
    </div>

    <!-- Role Modal -->
    <RoleModal
      v-if="showRoleModal"
      :role-to-edit="roleToEdit"
      :available-permissions="permissions"
      :is-loading="isCreatingRole || isUpdatingRole"
      @close="closeRoleModal"
      @create-role="handleRoleCreated"
      @update-role="handleRoleUpdated"
    />

    <!-- Permission Modal -->
    <PermissionModal
      v-if="showPermissionModal"
      :permission-to-edit="permissionToEdit"
      :categories="permissionCategories"
      :is-loading="isCreatingPermission || isUpdatingPermission"
      @close="closePermissionModal"
      @create-permission="handlePermissionCreated"
      @update-permission="handlePermissionUpdated"
    />

    <!-- Role Permissions Modal -->
    <RolePermissionsModal
      v-if="showRolePermissionsModal"
      :role="selectedRoleForPermissions"
      :available-permissions="permissions"
      :is-loading="isUpdatingRolePermissions"
      @close="closeRolePermissionsModal"
      @update-permissions="handleRolePermissionsUpdated"
    />

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="showConfirmationModal"
      :title="confirmationConfig.title"
      :message="confirmationConfig.message"
      :confirm-text="confirmationConfig.confirmText"
      :confirm-button-class="confirmationConfig.confirmButtonClass"
      :is-confirming="isDeletingRole || isDeletingPermission"
      @close="closeConfirmationModal"
      @confirm="handleConfirmation"
    />

    <NotificationToast
      :show="notification.show"
      :type="notification.type"
      :message="notification.message"
      @close="hideNotification"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import StatusBadge from '~/components/StatusBadge.vue'
import RoleModal from '~/components/RoleModal.vue'
import PermissionModal from '~/components/PermissionModal.vue'
import RolePermissionsModal from '~/components/RolePermissionsModal.vue'
import ConfirmationModal from '~/components/ConfirmationModal.vue'
import Pagination from '~/components/Pagination.vue'
import LoadingOverlay from '~/components/LoadingOverlay.vue'
import NotificationToast from '~/components/NotificationToast.vue'

// Modal states
const showRoleModal = ref(false)
const showPermissionModal = ref(false)
const showRolePermissionsModal = ref(false)
const showConfirmationModal = ref(false)

const roleToEdit = ref(null)
const permissionToEdit = ref(null)
const selectedRoleForPermissions = ref(null)

// Filter states
const selectedCategory = ref('')
const permissionFilter = ref('')

// Pagination
const permissionsCurrentPage = ref(1)
const permissionsPerPage = 10

// Loading states
const isLoadingRoles = ref(true)
const isLoadingPermissions = ref(true)
const isCreatingRole = ref(false)
const isUpdatingRole = ref(false)
const isDeletingRole = ref(false)
const isCreatingPermission = ref(false)
const isUpdatingPermission = ref(false)
const isDeletingPermission = ref(false)
const isUpdatingRolePermissions = ref(false)

// Confirmation config
const confirmationConfig = ref({
  title: '',
  message: '',
  confirmText: '',
  confirmButtonClass: '',
  onConfirm: () => {}
})

// Notification state
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

// Sample data (moved to be loaded by functions)
const initialPermissions = [
  { id: 'perm1', name: 'users.create', category: 'User Management', description: 'Kullanıcı oluşturma izni', isSystemPermission: true },
  { id: 'perm2', name: 'users.read', category: 'User Management', description: 'Kullanıcı görüntüleme izni', isSystemPermission: true },
  { id: 'perm3', name: 'users.update', category: 'User Management', description: 'Kullanıcı güncelleme izni', isSystemPermission: true },
  { id: 'perm4', name: 'users.delete', category: 'User Management', description: 'Kullanıcı silme izni', isSystemPermission: true },
  { id: 'perm5', name: 'projects.create', category: 'Project Management', description: 'Proje oluşturma izni', isSystemPermission: true },
  { id: 'perm6', name: 'projects.read', category: 'Project Management', description: 'Proje görüntüleme izni', isSystemPermission: true },
  { id: 'perm7', name: 'projects.update', category: 'Project Management', description: 'Proje güncelleme izni', isSystemPermission: true },
  { id: 'perm8', name: 'projects.delete', category: 'Project Management', description: 'Proje silme izni', isSystemPermission: true },
  { id: 'perm9', name: 'scheduler.create', category: 'Scheduler', description: 'Scheduler job oluşturma izni', isSystemPermission: true },
  { id: 'perm10', name: 'scheduler.read', category: 'Scheduler', description: 'Scheduler job görüntüleme izni', isSystemPermission: true },
  { id: 'perm11', name: 'scheduler.update', category: 'Scheduler', description: 'Scheduler job güncelleme izni', isSystemPermission: true },
  { id: 'perm12', name: 'scheduler.delete', category: 'Scheduler', description: 'Scheduler job silme izni', isSystemPermission: true },
  { id: 'perm13', name: 'messages.create', category: 'Message Templates', description: 'Mesaj şablonu oluşturma izni', isSystemPermission: true },
  { id: 'perm14', name: 'messages.read', category: 'Message Templates', description: 'Mesaj şablonu görüntüleme izni', isSystemPermission: true },
  { id: 'perm15', name: 'messages.update', category: 'Message Templates', description: 'Mesaj şablonu güncelleme izni', isSystemPermission: true },
  { id: 'perm16', name: 'messages.delete', category: 'Message Templates', description: 'Mesaj şablonu silme izni', isSystemPermission: true },
  { id: 'perm17', name: 'roles.create', category: 'Role Management', description: 'Rol oluşturma izni', isSystemPermission: true },
  { id: 'perm18', name: 'roles.read', category: 'Role Management', description: 'Rol görüntüleme izni', isSystemPermission: true },
  { id: 'perm19', name: 'roles.update', category: 'Role Management', description: 'Rol güncelleme izni', isSystemPermission: true },
  { id: 'perm20', name: 'roles.delete', category: 'Role Management', description: 'Rol silme izni', isSystemPermission: true },
]

const initialRoles = [
  {
    id: 'role1',
    name: 'Super Admin',
    description: 'Tüm sistem izinlerine sahip süper yönetici rolü',
    isActive: true,
    isSystemRole: true,
    userCount: 1,
    permissions: initialPermissions.map(p => p.id)
  },
  {
    id: 'role2',
    name: 'Admin',
    description: 'Yönetici rolü - çoğu işlemi yapabilir',
    isActive: true,
    isSystemRole: false,
    userCount: 3,
    permissions: ['perm1', 'perm2', 'perm3', 'perm5', 'perm6', 'perm7', 'perm9', 'perm10', 'perm11', 'perm13', 'perm14', 'perm15', 'perm18']
  },
  {
    id: 'role3',
    name: 'Developer',
    description: 'Geliştirici rolü - proje ve scheduler yönetimi',
    isActive: true,
    isSystemRole: false,
    userCount: 5,
    permissions: ['perm2', 'perm6', 'perm7', 'perm9', 'perm10', 'perm11', 'perm13', 'perm14', 'perm15']
  },
  {
    id: 'role4',
    name: 'Viewer',
    description: 'Görüntüleyici rolü - sadece okuma izinleri',
    isActive: true,
    isSystemRole: false,
    userCount: 8,
    permissions: ['perm2', 'perm6', 'perm10', 'perm14', 'perm18']
  },
  {
    id: 'role5',
    name: 'Inactive Role',
    description: 'Pasif durumdaki örnek rol',
    isActive: false,
    isSystemRole: false,
    userCount: 0,
    permissions: []
  }
]

const permissions = ref([])
const roles = ref([])

// Data fetching functions
const fetchPermissions = async () => {
  isLoadingPermissions.value = true
  await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API call
  permissions.value = initialPermissions
  isLoadingPermissions.value = false
}

const fetchRoles = async () => {
  isLoadingRoles.value = true
  await new Promise(resolve => setTimeout(resolve, 700)) // Simulate API call
  roles.value = initialRoles
  isLoadingRoles.value = false
}

// Computed properties
const permissionCategories = computed(() => {
  const categories = [...new Set(permissions.value.map(p => p.category))]
  return categories.sort()
})

const filteredPermissions = computed(() => {
  let filtered = permissions.value

  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }

  if (permissionFilter.value) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(permissionFilter.value.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(permissionFilter.value.toLowerCase()))
    )
  }

  return filtered
})

const permissionsTotalPages = computed(() => Math.ceil(filteredPermissions.value.length / permissionsPerPage))

const paginatedPermissions = computed(() => {
  const start = (permissionsCurrentPage.value - 1) * permissionsPerPage
  const end = start + permissionsPerPage
  return filteredPermissions.value.slice(start, end)
})

// Methods
const getCategoryClass = (category) => {
  const colors = {
    'User Management': 'bg-blue-500/20 text-blue-400',
    'Project Management': 'bg-green-500/20 text-green-400',
    'Scheduler': 'bg-purple-500/20 text-purple-400',
    'Message Templates': 'bg-yellow-500/20 text-yellow-400',
    'Role Management': 'bg-red-500/20 text-red-400'
  }
  return colors[category] || 'bg-gray-500/20 text-gray-400'
}

const getRoleCountForPermission = (permissionId) => {
  return roles.value.filter(role => role.permissions.includes(permissionId)).length
}

// Role Modal Methods
const openCreateRoleModal = () => {
  roleToEdit.value = null
  showRoleModal.value = true
}

const openEditRoleModal = (role) => {
  roleToEdit.value = role
  showRoleModal.value = true
}

const closeRoleModal = () => {
  showRoleModal.value = false
  roleToEdit.value = null
}

const handleRoleCreated = async (newRoleData) => {
  isCreatingRole.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const newRole = {
      ...newRoleData,
      id: uuidv4(),
      userCount: 0,
      isSystemRole: false
    }
    roles.value.unshift(newRole)
    showNotification('success', `'${newRole.name}' rolü başarıyla oluşturuldu!`);
    closeRoleModal()
  } catch (error) {
    console.error('Rol oluşturma hatası:', error);
    showNotification('error', 'Rol oluşturulurken bir hata oluştu.');
  } finally {
    isCreatingRole.value = false
  }
}

const handleRoleUpdated = async (updatedRoleData) => {
  isUpdatingRole.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const index = roles.value.findIndex(r => r.id === updatedRoleData.id)
    if (index !== -1) {
      roles.value[index] = { ...roles.value[index], ...updatedRoleData }
      showNotification('success', `'${updatedRoleData.name}' rolü başarıyla güncellendi!`);
    } else {
      showNotification('error', 'Güncellenecek rol bulunamadı.');
    }
    closeRoleModal()
  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    showNotification('error', 'Rol güncellenirken bir hata oluştu.');
  } finally {
    isUpdatingRole.value = false
  }
}

// Permission Modal Methods
const openCreatePermissionModal = () => {
  permissionToEdit.value = null
  showPermissionModal.value = true
}

const openEditPermissionModal = (permission) => {
  permissionToEdit.value = permission
  showPermissionModal.value = true
}

const closePermissionModal = () => {
  showPermissionModal.value = false
  permissionToEdit.value = null
}

const handlePermissionCreated = async (newPermissionData) => {
  isCreatingPermission.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const newPermission = {
      ...newPermissionData,
      id: uuidv4(),
      isSystemPermission: false
    }
    permissions.value.unshift(newPermission)
    showNotification('success', `'${newPermission.name}' izni başarıyla oluşturuldu!`);
    closePermissionModal()
  } catch (error) {
    console.error('İzin oluşturma hatası:', error);
    showNotification('error', 'İzin oluşturulurken bir hata oluştu.');
  } finally {
    isCreatingPermission.value = false
  }
}

const handlePermissionUpdated = async (updatedPermissionData) => {
  isUpdatingPermission.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const index = permissions.value.findIndex(p => p.id === updatedPermissionData.id)
    if (index !== -1) {
      permissions.value[index] = { ...permissions.value[index], ...updatedPermissionData }
      showNotification('success', `'${updatedPermissionData.name}' izni başarıyla güncellendi!`);
    } else {
      showNotification('error', 'Güncellenecek izin bulunamadı.');
    }
    closePermissionModal()
  } catch (error) {
    console.error('İzin güncelleme hatası:', error);
    showNotification('error', 'İzin güncellenirken bir hata oluştu.');
  } finally {
    isUpdatingPermission.value = false
  }
}

// Role Permissions Modal Methods
const openRolePermissionsModal = (role) => {
  selectedRoleForPermissions.value = role
  showRolePermissionsModal.value = true
}

const closeRolePermissionsModal = () => {
  showRolePermissionsModal.value = false
  selectedRoleForPermissions.value = null
}

const handleRolePermissionsUpdated = async (roleId, newPermissions) => {
  isUpdatingRolePermissions.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const roleIndex = roles.value.findIndex(r => r.id === roleId)
    if (roleIndex !== -1) {
      roles.value[roleIndex].permissions = newPermissions
      showNotification('success', `'${roles.value[roleIndex].name}' rolünün izinleri başarıyla güncellendi!`);
    } else {
      showNotification('error', 'Rol bulunamadı veya izinler güncellenemedi.');
    }
    closeRolePermissionsModal()
  } catch (error) {
    console.error('Rol izinleri güncelleme hatası:', error);
    showNotification('error', 'Rol izinleri güncellenirken bir hata oluştu.');
  } finally {
    isUpdatingRolePermissions.value = false
  }
}

// Delete confirmation methods
const openDeleteRoleConfirmation = (role) => {
  confirmationConfig.value = {
    title: 'Rolü Sil',
    message: `'${role.name}' rolünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve role sahip kullanıcılar etkilenebilir.`,
    confirmText: 'Sil',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: () => deleteRole(role.id, role.name)
  }
  showConfirmationModal.value = true
}

const openDeletePermissionConfirmation = (permission) => {
  confirmationConfig.value = {
    title: 'İzni Sil',
    message: `'${permission.name}' iznini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve bu izne sahip roller etkilenecektir.`,
    confirmText: 'Sil',
    confirmButtonClass: 'bg-red-600 hover:bg-red-700',
    onConfirm: () => deletePermission(permission.id, permission.name)
  }
  showConfirmationModal.value = true
}

const deleteRole = async (roleId, roleName) => {
  isDeletingRole.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const initialLength = roles.value.length;
    roles.value = roles.value.filter(r => r.id !== roleId)
    if (roles.value.length < initialLength) {
      showNotification('success', `'${roleName}' rolü başarıyla silindi!`);
    } else {
      showNotification('error', 'Rol bulunamadı veya silinemedi.');
    }
  } catch (error) {
    console.error('Rol silme hatası:', error);
    showNotification('error', 'Rol silinirken bir hata oluştu.');
  } finally {
    isDeletingRole.value = false
  }
}

const deletePermission = async (permissionId, permissionName) => {
  isDeletingPermission.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    const initialLength = permissions.value.length;
    permissions.value = permissions.value.filter(p => p.id !== permissionId)
    // Remove permission from all roles
    roles.value.forEach(role => {
      role.permissions = role.permissions.filter(p => p !== permissionId)
    })
    if (permissions.value.length < initialLength) {
      showNotification('success', `'${permissionName}' izni başarıyla silindi!`);
    } else {
      showNotification('error', 'İzin bulunamadı veya silinemedi.');
    }
  } catch (error) {
    console.error('İzin silme hatası:', error);
    showNotification('error', 'İzin silinirken bir hata oluştu.');
  } finally {
    isDeletingPermission.value = false
  }
}

const closeConfirmationModal = () => {
  showConfirmationModal.value = false
  isDeletingRole.value = false // Reset loading states if modal is closed
  isDeletingPermission.value = false // Reset loading states if modal is closed
}

const handleConfirmation = () => {
  if (confirmationConfig.value.onConfirm) {
    confirmationConfig.value.onConfirm()
  }
  // Loading state is handled by the specific deleteRole/deletePermission functions
  // closeConfirmationModal() is called by the finally block of deleteRole/deletePermission
}

onMounted(() => {
  fetchRoles()
  fetchPermissions()
})
</script>
