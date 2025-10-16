<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'
</script>

<template>
    <div class="flex items-center justify-between p-6">
        <div class="flex items-center gap-4">
            <div class="relative">
                <!-- Badge skeleton -->
                <Skeleton class="absolute -left-2 -top-2 h-6 w-6 rounded-full" />

                <!-- Avatar skeleton -->
                <Skeleton class="h-10 w-10 rounded-full" />
            </div>

            <div class="space-y-2">
                <!-- Username skeleton -->
                <Skeleton class="h-4 w-32" />

                <!-- Last commit skeleton -->
                <Skeleton class="h-3 w-24" />
            </div>
        </div>

        <div class="space-y-2">
            <!-- Commits count skeleton -->
            <Skeleton class="h-5 w-12 ml-auto" />

            <!-- "commits" text skeleton -->
            <Skeleton class="h-3 w-10" />
        </div>
    </div>
</template>