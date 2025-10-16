<script setup lang="ts">
import { ContributorRepos } from '../@types/Contributor.ts';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const model = defineModel<ContributorRepos>({
  required: true,
  default: ContributorRepos.CUSTOMBER_FRONTEND,
})
</script>

<template>
  <Select v-model="model">
    <SelectTrigger class="w-[200px]">
      <SelectValue placeholder="Select a repository" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem :value="ContributorRepos.CUSTOMBER_FRONTEND">
          Customer frontend
        </SelectItem>
        <SelectItem :value="ContributorRepos.ASPIRE_API">
          Aspire api
        </SelectItem>
        <SelectItem :value="ContributorRepos.NEOBANK_APP">
          Neobank App
        </SelectItem>
        <SelectItem :value="ContributorRepos.DASHBOARD">
          Dashboard
        </SelectItem>
        <SelectItem :value="ContributorRepos.MINT_UI">
          Mint UI
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
