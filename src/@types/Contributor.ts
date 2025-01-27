export type Contributor = {
  username: string;
  commit_count: number;
  latest_commit_date: string;
  avatar_url?: string | null;
}

export enum ContributorRepos {
  ASPIRE_API = 'aspire-api',
  NEOBANK_APP = 'neobank-app',
  CUSTOMBER_FRONTEND = 'customer-frontend',
}
