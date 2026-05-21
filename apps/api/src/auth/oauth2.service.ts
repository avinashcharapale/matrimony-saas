/**
 * OAuth2 Service
 * Handles OAuth2 authentication flows with external providers
 */

import axios from 'axios';
import { AuthDatabase } from './database';
import { JwtUtil } from './jwt.util';
import { CryptoUtil } from './crypto.util';
import type { SignOptions } from 'jsonwebtoken';
import { OAuth2UserInfo, OAuth2AuthRequest, TokenPair, JwtPayload } from './types';

interface OAuth2Config {
  jwtSecret: string;
  jwtExpiresIn: SignOptions['expiresIn'];
  refreshTokenSecret: string;
  refreshTokenExpiresIn: SignOptions['expiresIn'];
  sessionExpiresInMs: number;
}

export class OAuth2Service {
  private db: AuthDatabase;
  private config: OAuth2Config;

  constructor(db: AuthDatabase, config: OAuth2Config) {
    this.db = db;
    this.config = config;

    JwtUtil.initialize({
      jwtSecret: config.jwtSecret,
      jwtExpiresIn: config.jwtExpiresIn,
      refreshTokenSecret: config.refreshTokenSecret,
      refreshTokenExpiresIn: config.refreshTokenExpiresIn,
    });
  }

  /**
   * Handle OAuth2 callback and authenticate user
   */
  async handleCallback(request: OAuth2AuthRequest, tenantId: number): Promise<TokenPair> {
    try {
      // Get OAuth2 provider config
      const provider = await this.db.getOAuth2Provider(tenantId, request.provider);
      if (!provider || !provider.isEnabled) {
        throw new Error(`OAuth2 provider ${request.provider} is not configured or disabled`);
      }

      // Exchange authorization code for tokens
      const tokens = await this.exchangeCodeForTokens(provider, request.code, request.redirectUri);

      // Get user info from provider
      const userInfo = await this.getUserInfo(provider, tokens.access_token);

      // Find or create user
      let userId = await this.findUserByOAuth2Id(userInfo.id, provider.providerId);
      if (!userId) {
        userId = await this.createUserFromOAuth2(userInfo, tenantId);
      }

      // Store OAuth2 tokens
      const accessTokenExpiresAt = new Date(Date.now() + (tokens.expires_in * 1000 || 3600000));
      const refreshTokenExpiresAt = tokens.refresh_token
        ? new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
        : undefined;

      await this.db.storeOAuth2Token(
        userId,
        provider.providerId,
        CryptoUtil.hashToken(tokens.access_token),
        accessTokenExpiresAt,
        userInfo.id,
        tokens.refresh_token ? CryptoUtil.hashToken(tokens.refresh_token) : undefined,
        refreshTokenExpiresAt,
        tokens.scope
      );

      // Get user from database
      const user = await this.db.getUserById(userId);
      if (!user) {
        throw new Error('Failed to retrieve user after OAuth2 authentication');
      }

      // Generate JWT tokens
      const refreshTokenExpiresInMs = this.parseExpiry(this.config.refreshTokenExpiresIn);
      const refreshTokenId = await this.db.storeRefreshToken(
        userId,
        CryptoUtil.hashToken(CryptoUtil.generateToken()),
        new Date(Date.now() + refreshTokenExpiresInMs)
      );

      const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
      };

      const tokenPair = JwtUtil.generateTokenPair(jwtPayload, refreshTokenId);

      // Create session
      const sessionExpiresAt = new Date(Date.now() + this.config.sessionExpiresInMs);
      const sessionHash = CryptoUtil.hashToken(CryptoUtil.generateToken());
      await this.db.createSession(userId, sessionHash, sessionExpiresAt);

      // Record login
      await this.db.recordLogin(userId);

      return tokenPair;
    } catch (error) {
      throw new Error(`OAuth2 callback failed: ${(error as Error).message}`);
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  private async exchangeCodeForTokens(
    provider: any,
    code: string,
    redirectUri: string
  ): Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  }> {
    try {
      const response = await axios.post(provider.tokenUrl, {
        grant_type: 'authorization_code',
        code,
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        redirect_uri: redirectUri,
      });

      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to exchange OAuth2 code: ${axios.isAxiosError(error) ? error.response?.data?.error : (error as Error).message}`
      );
    }
  }

  /**
   * Get user info from OAuth2 provider
   */
  private async getUserInfo(provider: any, accessToken: string): Promise<OAuth2UserInfo> {
    try {
      const response = await axios.get(provider.userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;

      // Normalize different provider response formats
      return {
        id: data.id || data.sub || data.user_id,
        email: data.email,
        name: data.name || data.given_name,
        picture: data.picture || data.avatar_url,
      };
    } catch (error) {
      throw new Error(
        `Failed to get user info from OAuth2 provider: ${axios.isAxiosError(error) ? error.response?.data?.error : (error as Error).message}`
      );
    }
  }

  /**
   * Find user by OAuth2 provider user ID
   */
  private async findUserByOAuth2Id(providerUserId: string, providerId: number): Promise<number | null> {
    try {
      // In production, implement in AuthDatabase
      // This would query OAuth2Tokens table
      return null;
    } catch (error) {
      throw new Error(`Failed to find user by OAuth2 ID: ${(error as Error).message}`);
    }
  }

  /**
   * Create new user from OAuth2 info
   */
  private async createUserFromOAuth2(userInfo: OAuth2UserInfo, tenantId: number): Promise<number> {
    try {
      // In production, implement in AuthDatabase
      // This would create a new user record
      throw new Error('User creation from OAuth2 not yet implemented');
    } catch (error) {
      throw new Error(`Failed to create user from OAuth2: ${(error as Error).message}`);
    }
  }

  /**
   * Generate OAuth2 authorization URL
   */
  generateAuthorizationUrl(
    provider: string,
    tenantId: number,
    redirectUri: string,
    state: string
  ): string {
    // In production, get provider config and build URL
    // Example for Google:
    const params = new URLSearchParams({
      client_id: 'your-client-id',
      response_type: 'code',
      scope: 'openid profile email',
      redirect_uri: redirectUri,
      state,
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Parse expiry time string to milliseconds
   */
  private parseExpiry(expiry: string | number): number {
    if (typeof expiry === 'number') {
      return expiry;
    }

    const match = String(expiry).match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's':
        return num * 1000;
      case 'm':
        return num * 60 * 1000;
      case 'h':
        return num * 60 * 60 * 1000;
      case 'd':
        return num * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }
}
