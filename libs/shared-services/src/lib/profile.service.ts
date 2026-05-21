import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Profile } from '@org/models';
import { API_CONFIG } from './config/api.config';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private http = inject(HttpClient);
  private baseUrl = API_CONFIG.baseUrl;
  private currentProfileSubject = new BehaviorSubject<Profile | null>(null);
  public currentProfile$ = this.currentProfileSubject.asObservable();

  /**
   * Set the base URL for API requests (useful for environment overrides)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get user profile by ID
   */
  getProfile(userId: string): Observable<Profile> {
    const url = `${this.baseUrl}/profiles/${userId}`;
    return this.http.get<Profile>(url).pipe(
      tap((profile) => {
        this.currentProfileSubject.next(profile);
        // Store in localStorage for quick access
        localStorage.setItem('currentProfile', JSON.stringify(profile));
      })
    );
  }

  /**
   * Get current user's profile
   */
  getMyProfile(): Observable<Profile> {
    const url = `${this.baseUrl}/profiles/me`;
    return this.http.get<Profile>(url).pipe(
      tap((profile) => {
        this.currentProfileSubject.next(profile);
        localStorage.setItem('currentProfile', JSON.stringify(profile));
      })
    );
  }

  /**
   * Update user profile
   */
  updateProfile(userId: string, data: Partial<Profile>): Observable<Profile> {
    const url = `${this.baseUrl}/profiles/${userId}`;
    return this.http.put<Profile>(url, data).pipe(
      tap((profile) => {
        this.currentProfileSubject.next(profile);
        localStorage.setItem('currentProfile', JSON.stringify(profile));
      })
    );
  }

  /**
   * Partially update profile fields
   */
  updateProfilePartial(userId: string, data: Partial<Profile>): Observable<Profile> {
    const url = `${this.baseUrl}/profiles/${userId}`;
    return this.http.patch<Profile>(url, data).pipe(
      tap((profile) => {
        this.currentProfileSubject.next(profile);
        localStorage.setItem('currentProfile', JSON.stringify(profile));
      })
    );
  }

  /**
   * Upload profile image
   */
  uploadProfileImage(userId: string, file: File): Observable<{ imageUrl: string }> {
    const url = `${this.baseUrl}/profiles/${userId}/image`;
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ imageUrl: string }>(url, formData);
  }

  /**
   * Upload gallery images
   */
  uploadGalleryImages(userId: string, files: File[]): Observable<{ imageUrls: string[] }> {
    const url = `${this.baseUrl}/profiles/${userId}/gallery`;
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`images`, file);
    });
    return this.http.post<{ imageUrls: string[] }>(url, formData);
  }

  /**
   * Delete a gallery image
   */
  deleteGalleryImage(userId: string, imageUrl: string): Observable<void> {
    const url = `${this.baseUrl}/profiles/${userId}/gallery`;
    return this.http.delete<void>(url, {
      params: { imageUrl },
    });
  }

  /**
   * Get user profile completion
   */
  getProfileCompletion(userId: string): Observable<{ completionPercentage: number }> {
    const url = `${this.baseUrl}/profiles/${userId}/completion`;
    return this.http.get<{ completionPercentage: number }>(url);
  }

  /**
   * Verify user profile
   */
  verifyProfile(userId: string): Observable<{ verified: boolean }> {
    const url = `${this.baseUrl}/profiles/${userId}/verify`;
    return this.http.post<{ verified: boolean }>(url, {});
  }

  /**
   * Get current profile from memory
   */
  getCurrentProfile(): Profile | null {
    return this.currentProfileSubject.getValue();
  }

  /**
   * Load stored profile from localStorage
   */
  loadStoredProfile(): void {
    const storedProfile = localStorage.getItem('currentProfile');
    if (storedProfile) {
      try {
        this.currentProfileSubject.next(JSON.parse(storedProfile));
      } catch (e) {
        console.error('Failed to parse stored profile', e);
      }
    }
  }

  /**
   * Clear cached profile
   */
  clearProfile(): void {
    this.currentProfileSubject.next(null);
    localStorage.removeItem('currentProfile');
  }
}
