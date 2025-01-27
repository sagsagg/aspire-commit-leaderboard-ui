export type Contributor = {
  username: string;
  commit_count: number;
  latest_commit_date: string;
  latest_commit_message: string;
  avatar_url?: string | null;
}