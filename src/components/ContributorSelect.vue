<template>
  <select
    v-model="model"
    class="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 w-[200px]"
  >
    <option :value="ContributorRepos.CUSTOMBER_FRONTEND" selected>Customer frontend</option>
    <option :value="ContributorRepos.ASPIRE_API">Aspire api</option>
    <option :value="ContributorRepos.NEOBANK_APP">Neobank App</option>
    <option :value="ContributorRepos.DASHBOARD">Dashboard</option>
  </select>
</template>

<script setup lang="ts">
import { ContributorRepos } from '../@types/Contributor.ts';

const model = defineModel<ContributorRepos>({
  required: true,
  default: ContributorRepos.CUSTOMBER_FRONTEND,
})
</script>
