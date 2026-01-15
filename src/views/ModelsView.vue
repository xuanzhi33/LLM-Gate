<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, computed } from 'vue'
import { useModelConfigStore } from '@/stores/models'
import { Button } from '@/components/ui/button'
import ModelCard from '@/components/models/ModelCard.vue'
import ModelDeleteDialog from '@/components/models/ModelDeleteDialog.vue'
import { Plus, Search, Package, Sparkles } from 'lucide-vue-next'
import { nanoid } from 'nanoid'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'

const { t } = useI18n()
const modelStore = useModelConfigStore()

// Search
const searchQuery = ref('')

// Filtered model list
const filteredModels = computed(() => {
  const list = [...modelStore.configs].reverse()

  if (!searchQuery.value.trim()) {
    return list
  }
  const query = searchQuery.value.toLowerCase()
  return list.filter(model =>
    model.id.toLowerCase().includes(query) ||
    model.model?.toLowerCase().includes(query) ||
    model.baseUrl?.toLowerCase().includes(query)
  )
})

// Highlight newly created model
const newlyCreatedId = ref<string | null>(null)

// Delete confirmation dialog
const showDeleteDialog = ref(false)
const modelToDelete = ref<string | null>(null)

// Add new model
const handleAddModel = () => {
  const id = nanoid(6)
  modelStore.addConfig({
    id,
    model: '',
    baseUrl: '',
    apiKey: ''
  })
  newlyCreatedId.value = id
  // Clear search to ensure new model is visible
  searchQuery.value = ''
}

// Open delete confirmation dialog
const openDeleteDialog = (id: string) => {
  modelToDelete.value = id
  showDeleteDialog.value = true
}

// Confirm deletion
const confirmDelete = () => {
  if (modelToDelete.value) {
    modelStore.removeConfig(modelToDelete.value)
    showDeleteDialog.value = false
    modelToDelete.value = null
  }
}

</script>

<template>
  <div class="p-4 space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold flex items-center">
          <Package class="h-6 w-6 mr-2" />
          {{ t('models.title') }}
        </h1>
        <div class="text-sm text-muted-foreground mt-1">
          {{ t('common.modelCount', modelStore.count) }}
        </div>
      </div>
      <Button @click="handleAddModel">
        <Plus />
        {{ t('models.add') }}
      </Button>
    </div>

    <!-- Search box -->
    <InputGroup>
      <InputGroupInput type="search" v-model="searchQuery" :placeholder="t('models.search')" />
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupAddon :align="'inline-end'" v-if="searchQuery">
        {{ t('common.resultCount', filteredModels.length) }}
      </InputGroupAddon>
    </InputGroup>

    <!-- Models list -->
    <div v-if="filteredModels.length > 0" class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <TransitionGroup name="list">

        <ModelCard v-for="model in filteredModels" :key="model.id" :model="model" :is-new="model.id === newlyCreatedId"
          @delete="openDeleteDialog" />
      </TransitionGroup>
    </div>

    <!-- Empty state -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-center">
      <div class="text-muted-foreground space-y-3">
        <Sparkles class="h-12 w-12 mx-auto opacity-50" />
        <p class="text-lg font-medium">
          {{ searchQuery ? t('models.emptyFiltered') : t('models.empty') }}
        </p>
        <p v-if="!searchQuery" class="text-sm">
          <Button variant="link" @click="handleAddModel">
            {{ t('models.add') }}
          </Button>
        </p>
      </div>
    </div>

    <!-- Delete confirmation dialog -->
    <ModelDeleteDialog v-model:open="showDeleteDialog" @confirm="confirmDelete" />
  </div>
</template>
