import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  MatchEntityDto,
  MatchScoreDto,
  CreateMatchRequest,
  UpdateMatchStatusRequest,
  InterestRequestDto,
  SendInterestRequestDto,
  RespondToInterestRequest,
  CompatibilityRuleDto,
  CreateCompatibilityRuleRequest,
  UpdateRuleWeightRequest,
  ProfileShortlistDto,
  AddShortlistRequest,
  RecommendationDto,
  CreateRecommendationRequest,
} from './dtos';

@Injectable({ providedIn: 'root' })
export class MatchClient {
  private readonly http = inject(HttpClient);

  // ─── Matches ──────────────────────────────────────────────────────────────

  getMatchById(id: number): Observable<MatchEntityDto> {
    return this.http.get<MatchEntityDto>(`/match/Matches/${id}`);
  }

  getMatchesByProfile(profileId: number): Observable<MatchEntityDto[]> {
    return this.http.get<MatchEntityDto[]>(`/match/Matches/by-profile/${profileId}`);
  }

  getMatchScores(matchId: number): Observable<MatchScoreDto[]> {
    return this.http.get<MatchScoreDto[]>(`/match/Matches/${matchId}/scores`);
  }

  createMatch(body: CreateMatchRequest): Observable<void> {
    return this.http.post<void>('/match/Matches', body);
  }

  rescoreMatch(matchId: number): Observable<void> {
    return this.http.post<void>(`/match/Matches/${matchId}/rescore`, {});
  }

  updateMatchStatus(matchId: number, body: UpdateMatchStatusRequest): Observable<void> {
    return this.http.patch<void>(`/match/Matches/${matchId}/status`, body);
  }

  deleteMatch(matchId: number): Observable<void> {
    return this.http.delete<void>(`/match/Matches/${matchId}`);
  }

  // ─── Interest Requests ────────────────────────────────────────────────────

  getInterestRequestById(id: number): Observable<InterestRequestDto> {
    return this.http.get<InterestRequestDto>(`/match/InterestRequests/${id}`);
  }

  getInterestRequestsByRequester(requesterProfileId: number): Observable<InterestRequestDto[]> {
    return this.http.get<InterestRequestDto[]>(`/match/InterestRequests/by-requester/${requesterProfileId}`);
  }

  getInterestRequestsByTarget(targetProfileId: number): Observable<InterestRequestDto[]> {
    return this.http.get<InterestRequestDto[]>(`/match/InterestRequests/by-target/${targetProfileId}`);
  }

  sendInterestRequest(body: SendInterestRequestDto): Observable<void> {
    return this.http.post<void>('/match/InterestRequests', body);
  }

  respondToInterestRequest(id: number, body: RespondToInterestRequest): Observable<void> {
    return this.http.post<void>(`/match/InterestRequests/${id}/respond`, body);
  }

  withdrawInterestRequest(id: number): Observable<void> {
    return this.http.post<void>(`/match/InterestRequests/${id}/withdraw`, {});
  }

  deleteInterestRequest(id: number): Observable<void> {
    return this.http.delete<void>(`/match/InterestRequests/${id}`);
  }

  // ─── Compatibility Rules ──────────────────────────────────────────────────

  getCompatibilityRuleById(id: number): Observable<CompatibilityRuleDto> {
    return this.http.get<CompatibilityRuleDto>(`/match/CompatibilityRules/${id}`);
  }

  getAllCompatibilityRules(): Observable<CompatibilityRuleDto[]> {
    return this.http.get<CompatibilityRuleDto[]>('/match/CompatibilityRules');
  }

  createCompatibilityRule(body: CreateCompatibilityRuleRequest): Observable<void> {
    return this.http.post<void>('/match/CompatibilityRules', body);
  }

  updateRuleWeight(id: number, body: UpdateRuleWeightRequest): Observable<void> {
    return this.http.patch<void>(`/match/CompatibilityRules/${id}/weight`, body);
  }

  deleteCompatibilityRule(id: number): Observable<void> {
    return this.http.delete<void>(`/match/CompatibilityRules/${id}`);
  }

  // ─── Profile Shortlists ───────────────────────────────────────────────────

  getShortlistById(id: number): Observable<ProfileShortlistDto> {
    return this.http.get<ProfileShortlistDto>(`/match/ProfileShortlists/${id}`);
  }

  getShortlistsByProfile(profileId: number): Observable<ProfileShortlistDto[]> {
    return this.http.get<ProfileShortlistDto[]>(`/match/ProfileShortlists/by-profile/${profileId}`);
  }

  addShortlist(body: AddShortlistRequest): Observable<void> {
    return this.http.post<void>('/match/ProfileShortlists', body);
  }

  deleteShortlist(id: number): Observable<void> {
    return this.http.delete<void>(`/match/ProfileShortlists/${id}`);
  }

  // ─── Recommendations ──────────────────────────────────────────────────────

  generateRecommendations(profileId: number, maxResults = 20): Observable<void> {
    return this.http.post<void>(`/match/Recommendations/generate/${profileId}?maxResults=${maxResults}`, {});
  }

  getRecommendationById(id: number): Observable<RecommendationDto> {
    return this.http.get<RecommendationDto>(`/match/Recommendations/${id}`);
  }

  getRecommendationsByProfile(profileId: number): Observable<RecommendationDto[]> {
    return this.http.get<RecommendationDto[]>(`/match/Recommendations/by-profile/${profileId}`);
  }

  createRecommendation(body: CreateRecommendationRequest): Observable<void> {
    return this.http.post<void>('/match/Recommendations', body);
  }

  dismissRecommendation(id: number): Observable<void> {
    return this.http.post<void>(`/match/Recommendations/${id}/dismiss`, {});
  }

  viewRecommendation(id: number): Observable<void> {
    return this.http.post<void>(`/match/Recommendations/${id}/view`, {});
  }
}
