export interface FriendLink {
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly author?: string;
  readonly tags: readonly string[];
}
