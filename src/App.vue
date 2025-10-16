<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import { useDark, useToggle, useDateFormat, useNow } from '@vueuse/core';
import { GitGraph, Frown, CloudAlert, Moon, Sun } from 'lucide-vue-next';
import { type Contributor, ContributorRepos } from './@types/Contributor.ts';
import ContributorItem from './components/ContributorItem.vue';
import ContributorItemSkeleton from './components/ContributorItemSkeleton.vue';
import ContributorSelect from './components/ContributorSelect.vue';
import { type ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useApolloQuery } from '@/composables/useApolloQuery';

// GraphQL query
const GET_LEADERBOARD = gql`
  query GetLeaderboard($repo: String!) {
    GetLeaderboard(repo: $repo) {
      username
      commit_count
      latest_commit_date
      avatar_url
    }
  }
`;

const isDark = useDark();
const selectedRepo = ref<ContributorRepos>(ContributorRepos.CUSTOMBER_FRONTEND);
const toggleDark = useToggle(isDark);

// Inject Apollo Client
const apolloClient = inject<ApolloClient<any>>('apolloClient');

if (!apolloClient) {
  throw new Error('Apollo Client not provided');
}

// Use custom Apollo Query composable
const { result, loading, error } = useApolloQuery<{ GetLeaderboard: Contributor[] }>(
  apolloClient,
  GET_LEADERBOARD,
  {
    variables: computed(() => ({ repo: selectedRepo.value })),
    fetchPolicy: 'cache-and-network',
  }
);

const contributors = computed<Contributor[]>(() => result.value?.GetLeaderboard || []);

const formattedCurrentDate = useDateFormat(useNow(), 'DD-MM-YYYY');
</script>

<template>
  <div class="bg-background" :class="isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'">
    <div class="min-h-screen mx-auto p-8 max-w-2xl">
      <Card class="mx-auto">
        <CardHeader class="border-b">
          <div class="flex items-center justify-between">
            <CardTitle class="flex gap-2 items-start">
              <GitGraph class="mt-1" />
              <div class="flex flex-col">
                <span>Commit leaderboard</span>
                <span class="text-sm font-normal text-muted-foreground">{{ formattedCurrentDate }}</span>
              </div>
            </CardTitle>
            <Button 
              @click="toggleDark()"
              variant="outline" 
              size="icon"
              aria-label="Toggle theme">
              <Sun v-if="isDark" class="h-[1.2rem] w-[1.2rem]" />
              <Moon v-else class="h-[1.2rem] w-[1.2rem]" />
            </Button>
          </div>
        </CardHeader>

        <CardContent class="pt-6">
          <ContributorSelect v-model="selectedRepo" />
        </CardContent>

        <div class="divide-y divide-border">
          <ContributorItemSkeleton v-if="loading" />

          <template v-else>
            <template v-if="contributors.length">
              <ContributorItem v-for="(contributor, index) in contributors" :key="contributor.username"
                :contributor="contributor" :index="index" :isDark="isDark" />
            </template>

            <template v-else-if="error">
              <div class="p-6">
                <Alert variant="destructive">
                  <CloudAlert class="h-4 w-4" />
                  <AlertDescription>
                    Something went wrong. Please try again later.
                  </AlertDescription>
                </Alert>
              </div>
            </template>

            <template v-else-if="!contributors.length">
              <div class="p-6">
                <Alert>
                  <Frown class="h-4 w-4" />
                  <AlertDescription>
                    No commits for now.
                  </AlertDescription>
                </Alert>
              </div>
            </template>
          </template>
        </div>
      </Card>
    </div>
  </div>
</template>
