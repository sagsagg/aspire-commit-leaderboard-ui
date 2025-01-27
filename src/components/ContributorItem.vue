<template>
    <div class="flex items-center justify-between p-6">
        <div class="flex items-center gap-4">
            <div class="relative">
                <span
                    class="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                    :class="isDark ? 'bg-stone-600' : 'bg-stone-700'">
                    {{ index + 1 }}
                </span>

                <img
                  v-if="contributor.avatar_url"
                  class="h-10 w-10 rounded-full"
                  :src="contributor.avatar_url"
                  :alt="contributor.username">
            </div>

            <div>
                <p class="font-medium mb-1" :class="{
                    'flex items-center gap-1': index === 0
                }">
                    <Crown v-if="index === 0" class="text-yellow-300" />
                    {{ contributor.username }}
                </p>
                <p v-if="contributor.latest_commit_date" class="text-sm text-muted-foreground">
                    Last commit {{ timeAgo(contributor.latest_commit_date) }}
                </p>
            </div>
        </div>

        <div class="text-right">
            <p class="text-lg font-bold mb-1">
                {{ contributor.commit_count }}
            </p>
            <p class="text-sm text-muted-foreground">
                commits
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core';
import { Crown } from 'lucide-vue-next';
import { type Contributor } from '../@types/Contributor.ts';

type Props = {
    contributor: Contributor;
    index: number;
    isDark: boolean;
}

defineProps<Props>();

const timeAgo = (date: Date | string) => {
    const time = useTimeAgo(typeof date === 'string' ? new Date(date) : date)
    return time.value
}
</script>
