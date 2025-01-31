<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDark, useToggle, useFetch } from '@vueuse/core';
import { GitGraph, Frown } from 'lucide-vue-next';
import { type Contributor, ContributorRepos } from './@types/Contributor.ts';
import ContributorItem from './components/ContributorItem.vue';
import ContributorItemSkeleton from './components/ContributorItemSkeleton.vue';
import ContributorSelect from './components/ContributorSelect.vue';

const isDark = useDark();
const selectedRepo = ref<ContributorRepos>(ContributorRepos.CUSTOMBER_FRONTEND);

const endpointUrl = computed(() => {
  return `${import.meta.env.VITE_API_ENDPOINT}/api/leaderboard?repo=${selectedRepo.value}`;
});

const toggleDark = useToggle(isDark);
const { isFetching, data } = useFetch(endpointUrl, { refetch: true });

// Persist data in localStorage
const contributors = computed<Contributor[]>(() => JSON.parse(data.value as string) || []);
</script>

<template>
  <div class="bg-background" :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'">
    <div class="min-h-screen mx-auto p-8 max-w-2xl">
      <div class="rounded-lg border text-card-foreground shadow-sm mx-auto"
        :class="isDark ? 'bg-gray-800' : 'bg-gray-50'">
        <div class="flex items-center justify-between border-b border-border p-6">
          <h1 class="text-2xl font-semibold flex items-center gap-2">
            <GitGraph /> Spend commit leaderboard
          </h1>
          <button @click="toggleDark()"
            class="p-2 cursor-pointer rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme">
            {{ isDark ? '🌞' : '🌙' }}
          </button>
        </div>

        <div class="p-6">
          <ContributorSelect v-model="selectedRepo" />
        </div>

        <div class="divide-y divide-border">
          <ContributorItemSkeleton v-if="isFetching" />

          <template v-else>
            <template v-if="contributors.length">
              <ContributorItem v-for="(contributor, index) in contributors" :key="contributor.username"
                :contributor="contributor" :index="index" :isDark="isDark" />
            </template>

            <template v-else>
              <div class="p-6 text-center">
                <p class="text-lg font-semibold flex items-center justify-center gap-2">
                  <Frown /> No commit for now
                </p>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
