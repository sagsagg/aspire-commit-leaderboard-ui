export type Contributor = {
  username: string;
  commit_count: number;
  latest_commit_date: string;
  avatar_url?: string | null;
  latest_commit_message: string;
  user_login: string;
}

export enum ContributorRepos {
  ASPIRE_API = 'aspire-api',
  NEOBANK_APP = 'neobank-app',
  CUSTOMBER_FRONTEND = 'customer-frontend',
}
