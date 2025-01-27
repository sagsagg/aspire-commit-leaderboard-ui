<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDark, useToggle } from '@vueuse/core';
import { Contributor } from './@types/Contributor.ts';
import ContributorItem from './components/ContributorItem.vue';

// Dark mode setup with vueuse
const isDark = useDark()
const toggleDark = useToggle(isDark)

// Persist data in localStorage
const contributors = ref<Contributor[]>([
    {
        username: "Tien",
        commit_count: 32,
        latest_commit_date: "2025-01-24T12:46:32Z",
        latest_commit_message: "[Feature Fix] PAYMT-7196 Transfer Step Review: Reference Info CSS improvements (#9927)\n\n* css improvements\r\n\r\n* code review changes\r\n\r\n* code review changes",
        avatar_url: "https://avatars.githubusercontent.com/u/904724?v=4"
    },
    {
        username: "Hoai",
        commit_count: 8,
        latest_commit_date: "2025-01-24T06:30:55Z",
        latest_commit_message: "[Feature-fix] [PRD-4938] Adjust CTA styling and prevent overlap for short content. #9928 (#9929)\n\n[Fix] Adjust CTA styling and prevent overlap for short content in BluePhysicalCardActivationStepInfo",
        avatar_url: "https://avatars.githubusercontent.com/u/287063?v=4"
    },
]);
</script>

<template>
    <div class="min-h-screen bg-background p-8"
        :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'">
        <div class="rounded-lg border text-card-foreground shadow-sm mx-auto max-w-2xl"
            :class="isDark ? 'bg-gray-800' : 'bg-gray-50'">
            <div class="flex items-center justify-between border-b border-border p-6">
                <h1 class="text-2xl font-semibold">Commit Leaderboard</h1>
                <button @click="toggleDark()"
                    class="p-2 cursor-pointer rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle theme">
                    {{ isDark ? '🌞' : '🌙' }}
                </button>
            </div>

            <div class="divide-y divide-border">
                <ContributorItem v-for="(contributor, index) in contributors" :key="contributor.username"
                    :contributor="contributor" :index="index" :isDark="isDark" />
            </div>
        </div>
    </div>
</template>