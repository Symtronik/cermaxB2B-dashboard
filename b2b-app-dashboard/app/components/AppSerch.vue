<template>
  <UButton
    :label="collapsed ? undefined : 'Search...'"
    icon="i-lucide-search"
    color="neutral"
    variant="outline"
    block
    :square="collapsed"
  >
    <template
      v-if="!collapsed"
      #trailing
    >
      <div class="flex items-center gap-0.5 ms-auto">
        <UKbd
          value="meta"
          variant="subtle"
        />
        <UKbd
          value="K"
          variant="subtle"
        />
      </div>
    </template>
  </UButton>
</template>

