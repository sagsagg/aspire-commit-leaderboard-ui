<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core';
import { Crown } from 'lucide-vue-next';
import { type Contributor } from '../@types/Contributor.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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

<template>
    <div class="flex items-center justify-between p-6">
        <div class="flex items-center gap-4">
            <div class="relative">
                <Badge 
                    class="absolute -left-3 -top-3 h-6 w-6 flex items-center justify-center p-0 text-xs z-10"
                    :variant="index === 0 ? 'default' : 'secondary'">
                    {{ index + 1 }}
                </Badge>

                <Avatar class="h-10 w-10">
                    <AvatarImage 
                        v-if="contributor.avatar_url"
                        :src="contributor.avatar_url" 
                        :alt="contributor.username" 
                    />
                    <AvatarFallback>
                        {{ contributor.username.substring(0, 2).toUpperCase() }}
                    </AvatarFallback>
                </Avatar>
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
