import { GitProvider } from "../../git-provider.interface";
import {
  OAuthData,
  Branch,
  CreateBranchIfNotExistsArgs,
  CreateCommitArgs,
  CreatePullRequestForBranchArgs,
  CreatePullRequestFromFilesArgs,
  CreateRepositoryArgs,
  CurrentUser,
  GetFileArgs,
  GetPullRequestForBranchArgs,
  GetRepositoriesArgs,
  GetRepositoryArgs,
  GitFile,
  RemoteGitOrganization,
  RemoteGitRepos,
  RemoteGitRepository,
  OAuth2FlowResponse,
  CloneUrlArgs,
  Commit,
  CreateBranchArgs,
  CreatePullRequestCommentArgs,
  EnumGitProvider,
  GetBranchArgs,
  PullRequest,
  GitProviderArgs,
  PaginatedGitGroup,
  BitBucketConfiguration,
} from "../../types";
import { NotImplementedError } from "../../utils/custom-error";
import {
  authDataRequest,
  authorizeRequest,
  currentUserRequest,
  currentUserWorkspacesRequest,
} from "./requests";
import { ILogger } from "@amplication/util/logging";

export class BitBucketService implements GitProvider {
  private clientId: string;
  private clientSecret: string;
  public readonly name = EnumGitProvider.Bitbucket;
  public readonly domain = "bitbucket.com";

  constructor(
    private readonly gitProviderArgs: GitProviderArgs,
    private readonly providerConfiguration: BitBucketConfiguration,
    private readonly logger: ILogger
  ) {}

  async init(): Promise<void> {
    this.logger.info("BitbucketService init");
    const { clientId, clientSecret } = this.providerConfiguration;
    if (!clientId || !clientSecret) {
      this.logger.error("Missing Bitbucket configuration");
      throw new Error("Missing Bitbucket configuration");
    }

    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  getGitInstallationUrl(amplicationWorkspaceId: string): Promise<string> {
    return authorizeRequest(this.clientId, amplicationWorkspaceId);
  }

  private async getAccessToken(authorizationCode: string): Promise<OAuthData> {
    const response = await authDataRequest(
      this.clientId,
      this.clientSecret,
      authorizationCode
    );

    this.logger.info("BitBucketService getAccessToken");
    const authData = await response.json();

    return {
      accessToken: authData.access_token,
      refreshToken: authData.refresh_token,
      scopes: authData.scopes.split(" "),
      tokenType: authData.token_type,
      expiresIn: authData.expires_in,
    };
  }

  private async getCurrentUser(
    accessToken: string,
    refreshToken
  ): Promise<CurrentUser> {
    const currentUser = await currentUserRequest(
      accessToken,
      this.clientId,
      this.clientSecret,
      refreshToken,
      this.logger
    );

    const { links, display_name, username, uuid } = currentUser;
    this.logger.info("BitBucketService getCurrentUser");
    return {
      links,
      displayName: display_name,
      username,
      uuid,
    };
  }

  async completeOAuth2Flow(
    authorizationCode: string
  ): Promise<OAuth2FlowResponse> {
    const oAuthData = await this.getAccessToken(authorizationCode);

    const currentUserData = await this.getCurrentUser(
      oAuthData.accessToken,
      oAuthData.refreshToken
    );

    this.logger.info("BitBucketService completeOAuth2Flow");

    return {
      providerOrganizationProperties: {
        ...oAuthData,
        ...currentUserData,
      },
      useGroupingForRepositories: true,
    };
  }

  async getGitGroups(): Promise<PaginatedGitGroup> {
    const { accessToken, refreshToken } =
      this.gitProviderArgs.providerOrganizationProperties;
    const paginatedWorkspaceMembership = await currentUserWorkspacesRequest(
      accessToken,
      this.clientId,
      this.clientSecret,
      refreshToken,
      this.logger
    );

    const { size, page, pagelen, next, previous, values } =
      paginatedWorkspaceMembership;
    const gitGroups = values.map(({ workspace }) => {
      const { uuid: workspaceUuid, name, slug } = workspace;
      return {
        id: workspaceUuid,
        name,
        slug,
      };
    });

    this.logger.info("BitBucketService getGitGroups");

    return {
      size,
      page,
      pagelen,
      next,
      previous,
      groups: gitGroups,
    };
  }

  async getOrganization(): Promise<RemoteGitOrganization> {
    throw NotImplementedError;
  }

  getRepository(
    getRepositoryArgs: GetRepositoryArgs
  ): Promise<RemoteGitRepository> {
    throw NotImplementedError;
  }

  getRepositories(
    getRepositoriesArgs: GetRepositoriesArgs
  ): Promise<RemoteGitRepos> {
    throw NotImplementedError;
  }

  createRepository(
    createRepositoryArgs: CreateRepositoryArgs
  ): Promise<RemoteGitRepository> {
    throw NotImplementedError;
  }

  deleteGitOrganization(): Promise<boolean> {
    throw NotImplementedError;
  }

  // pull request flow

  getFile(file: GetFileArgs): Promise<GitFile> {
    throw NotImplementedError;
  }

  createPullRequestFromFiles(
    createPullRequestFromFilesArgs: CreatePullRequestFromFilesArgs
  ): Promise<string> {
    throw NotImplementedError;
  }

  createBranchIfNotExists(
    createBranchIfNotExistsArgs: CreateBranchIfNotExistsArgs
  ): Promise<Branch> {
    throw NotImplementedError;
  }

  createCommit(createCommitArgs: CreateCommitArgs): Promise<void> {
    throw NotImplementedError;
  }

  getPullRequestForBranch(
    getPullRequestForBranchArgs: GetPullRequestForBranchArgs
  ): Promise<{ url: string; number: number }> {
    throw NotImplementedError;
  }

  createPullRequestForBranch(
    createPullRequestForBranchArgs: CreatePullRequestForBranchArgs
  ): Promise<PullRequest> {
    throw NotImplementedError;
  }
  getBranch(args: GetBranchArgs): Promise<Branch | null> {
    throw NotImplementedError;
  }
  createBranch(args: CreateBranchArgs): Promise<Branch> {
    throw NotImplementedError;
  }
  getFirstCommitOnBranch(args: GetBranchArgs): Promise<Commit> {
    throw NotImplementedError;
  }
  getCurrentUserCommitList(args: GetBranchArgs): Promise<Commit[]> {
    throw NotImplementedError;
  }
  getCloneUrl(args: CloneUrlArgs): string {
    throw NotImplementedError;
  }
  commentOnPullRequest(args: CreatePullRequestCommentArgs): Promise<void> {
    throw NotImplementedError;
  }
  getToken(): Promise<string> {
    throw NotImplementedError;
  }
}
