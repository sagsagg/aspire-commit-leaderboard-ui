<template>
    <div class="flex items-center justify-between p-6 animate-pulse">
        <div class="flex items-center gap-4">
            <div class="relative">
                <!-- Badge skeleton -->
                <div class="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-gray-300"></div>

                <!-- Avatar skeleton -->
                <div class="h-10 w-10 rounded-full bg-gray-300"></div>
            </div>

            <div class="space-y-2">
                <!-- Username skeleton -->
                <div class="h-4 w-32 rounded bg-gray-300"></div>

                <!-- Last commit skeleton -->
                <div class="h-3 w-24 rounded bg-gray-200"></div>
            </div>
        </div>

        <div class="space-y-2">
            <!-- Commits count skeleton -->
            <div class="h-5 w-12 rounded bg-gray-300 ml-auto"></div>

            <!-- "commits" text skeleton -->
            <div class="h-3 w-10 rounded bg-gray-200"></div>
        </div>
    </div>
</template>