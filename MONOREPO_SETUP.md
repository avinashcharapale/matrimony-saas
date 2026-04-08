# Matrimony SaaS Monorepo Setup Guide

This document outlines the complete Nx monorepo structure created for the Matrimony SaaS platform using Angular and Ionic.

## ✅ Created Structure

### Applications (`apps/`)

#### 1. **Web Angular App** (`apps/web-angular`)
- **Purpose**: Main web application for desktop/browser users
- **Framework**: Angular 21.2.5 + Vite
- **Build System**: Nx with Vite
- **Entry**: `apps/web-angular/src/main.ts`

```bash
# Development
npx nx serve web-angular

# Build Production
npx nx build web-angular

# Run Tests  
npx nx test web-angular

# Lint
npx nx lint web-angular
```

#### 2. **Mobile Ionic App** (`apps/mobile-ionic`)
- **Purpose**: Cross-platform mobile app (iOS/Android)
- **Framework**: Angular 21.2.5 + Ionic
- **Build System**: Nx with Vite + Ionic CLI (ready for Capacitor)
- **Entry**: `apps/mobile-ionic/src/main.ts`

```bash
# Development
npx nx serve mobile-ionic

# Build for Capacitor (iOS/Android)
npx nx build mobile-ionic

# Run Tests
npx nx test mobile-ionic

# Lint
npx nx lint mobile-ionic
```

---

### Libraries (`libs/`)

#### 1. **Matrimony Models** (`libs/matrimony-models`)
- **Purpose**: Shared TypeScript interfaces and data models
- **Contains**: 
  - User profiles, preferences, matching models
  - Request/Response DTOs
  - Enums and types for the platform
- **Export Path**: `@org/matrimony-models`

**Usage in apps:**
```typescript
import { UserProfile, Match } from '@org/matrimony-models';
```

#### 2. **Shared Services** (`libs/shared-services`)
- **Purpose**: API service layer and business logic
- **Contains**:
  - HTTP API calls
  - Angular Services (ProfileService, MatchService, etc.)
  - Data handling and transformation
- **Export Path**: `@org/shared-services`

**Usage in apps:**
```typescript
import { ProfileService, MatchService } from '@org/shared-services';
```

#### 3. **Shared Models** (`libs/shared/models`)
- **Purpose**: General shared models (pre-existing)
- **Export Path**: `@org/models`

---

## 📁 Project Structure

```
matrimony-saas/
├── apps/
│   ├── web-angular/                 # Angular web SPA
│   │   ├── src/
│   │   │   ├── app/                 # Main app component
│   │   │   │   ├── app.ts
│   │   │   │   ├── app.routes.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   └── app.html
│   │   │   ├── main.ts              # Bootstrap file
│   │   │   ├── index.html
│   │   │   └── styles.css
│   │   ├── project.json
│   │   ├── vite.config.mts
│   │   └── tsconfig.app.json
│   │
│   ├── mobile-ionic/                # Ionic mobile app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── main.ts
│   │   │   ├── index.html
│   │   │   └── styles.css
│   │   ├── project.json
│   │   ├── vite.config.mts
│   │   └── tsconfig.app.json
│   │
│   └── [*-e2e]/                    # E2E tests (auto-generated)
│
├── libs/
│   ├── matrimony-models/            # Data models & interfaces
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   └── matrimony-models/
│   │   │   └── index.ts             # Export barrel
│   │   └── project.json
│   │
│   ├── shared-services/             # API services & business logic
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   └── shared-services/
│   │   │   └── index.ts
│   │   └── project.json
│   │
│   ├── shared/
│   │   └── models/                  # General shared models
│   │
│   ├── api/
│   │   └── products/                # Existing API library
│   │
│   └── shop/                        # Existing shop features
│
├── nx.json                          # Nx workspace config
├── tsconfig.base.json               # TypeScript base config
├── package.json
└── pnpm-lock.yaml / package-lock.json
```

---

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
# or
pnpm install
```

### 1. Set Up Models Library

**File**: `libs/matrimony-models/src/lib/matrimony-models/matrimony-models.ts`

```typescript
// User Profile Model
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  profilePhoto?: string;
  bio?: string;
  religion?: string;
  caste?: string;
  education?: string;
  occupation?: string;
  income?: number;
  location?: string;
  preferences?: PreferenceSettings;
  createdAt: Date;
  updatedAt: Date;
}

// Preference Settings
export interface PreferenceSettings {
  ageMin: number;
  ageMax: number;
  genderPreference: string;
  locationPreference?: string;
  educationPreference?: string;
  religionPreference?: string;
}

// Match Model
export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'message_sent';
  createdAt: Date;
  updatedAt: Date;
}

// Success Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

**Export**: `libs/matrimony-models/src/index.ts`

```typescript
export * from './lib/matrimony-models/matrimony-models';
```

### 2. Set Up Services Library

**File**: `libs/shared-services/src/lib/services/profile.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile, ApiResponse } from '@org/matrimony-models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private apiUrl = 'http://localhost:3000/api/profiles';

  constructor(private http: HttpClient) {}

  getProfile(userId: string): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: string, profile: UserProfile): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(`${this.apiUrl}/${userId}`, profile);
  }
}
```

**File**: `libs/shared-services/src/lib/services/match.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Match, ApiResponse } from '@org/matrimony-models';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private apiUrl = 'http://localhost:3000/api/matches';

  constructor(private http: HttpClient) {}

  getMatches(userId: string): Observable<ApiResponse<Match[]>> {
    return this.http.get<ApiResponse<Match[]>>(`${this.apiUrl}?userId=${userId}`);
  }

  acceptMatch(matchId: string): Observable<ApiResponse<Match>> {
    return this.http.patch<ApiResponse<Match>>(`${this.apiUrl}/${matchId}`, { status: 'accepted' });
  }

  rejectMatch(matchId: string): Observable<ApiResponse<Match>> {
    return this.http.patch<ApiResponse<Match>>(`${this.apiUrl}/${matchId}`, { status: 'rejected' });
  }
}
```

**Export**: `libs/shared-services/src/index.ts`

```typescript
export * from './lib/services/profile.service';
export * from './lib/services/match.service';
```

### 3. Use in Web App

**File**: `apps/web-angular/src/app/app.config.ts`

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(),
  ],
};
```

**File**: `apps/web-angular/src/app/app.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileService, MatchService } from '@org/shared-services';
import { UserProfile } from '@org/matrimony-models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1>Welcome to Matrimony SaaS</h1>
      <div *ngIf="userProfile">
        <h2>{{ userProfile.name }}</h2>
        <p>{{ userProfile.bio }}</p>
      </div>
    </div>
  `,
})
export class AppComponent {
  profileService = inject(ProfileService);
  userProfile: UserProfile | null = null;

  ngOnInit() {
    this.profileService.getProfile('user-id').subscribe((response) => {
      if (response.success) {
        this.userProfile = response.data || null;
      }
    });
  }
}
```

### 4. Use in Mobile App

Same imports work for the mobile Ionic app:

```typescript
import { ProfileService } from '@org/shared-services';
import { UserProfile } from '@org/matrimony-models';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

// Use in Ionic components the same way
```

---

## 📦 Build & Deploy Commands

### Development

```bash
# Serve web app
npx nx serve web-angular --open

# Serve mobile app
npx nx serve mobile-ionic --open

# Run both in parallel
npx nx run-many --target=serve --projects=web-angular,mobile-ionic
```

### Testing

```bash
# Test single project
npx nx test web-angular

# Test all
npx nx run-many --target=test --all

# Test with coverage
npx nx run-many --target=test --all --coverage
```

### Linting

```bash
# Lint single project
npx nx lint web-angular

# Lint all
npx nx run-many --target=lint --all
```

### Building

```bash
# Build web for production
npx nx build web-angular --configuration=production

# Build mobile for production
npx nx build mobile-ionic --configuration=production

# Build all projects
npx nx run-many --target=build --all --configuration=production
```

---

## 🔗 Workspace Dependencies

The tsconfig paths are automatically configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@org/matrimony-models": ["libs/matrimony-models/src/index.ts"],
      "@org/shared-services": ["libs/shared-services/src/index.ts"],
      "@org/models": ["libs/shared/models/src/index.ts"],
      "@org/api-products": ["libs/api/products/src/index.ts"],
      "@org/shop-data": ["libs/shop/data/src/index.ts"]
    }
  }
}
```

---

## ✨ Next Steps

1. **Add Ionic Framework** to mobile app:
   ```bash
   npm install @ionic/angular @ionic/core ionicons
   ```

2. **Add HTTP Interceptors** in shared-services:
   - Authentication tokens
   - Error handling
   - Request/response logging

3. **Set up State Management** (NgRx/Akita):
   ```bash
   npx nx g @nx/angular:ngrx-root-store
   ```

4. **Add UI Component Library**:
   ```bash
   # For web
   npm install @angular/material
   
   # For mobile (already included with Ionic)
   ```

5. **Configure API Base URL** for different environments

6. **Set up CI/CD** pipeline with Nx Cloud

---

## 📚 Useful Resources

- [Nx Documentation](https://nx.dev)
- [Nx Angular Plugin](https://nx.dev/packages/angular)
- [Angular Documentation](https://angular.io)
- [Ionic Framework](https://ionicframework.com)
- [Vite Documentation](https://vitejs.dev)

---

## 🎯 Project Aliases

When using workspace libraries, always use the alias paths:

```typescript
// ✅ Good
import { ProfileService } from '@org/shared-services';
import { UserProfile } from '@org/matrimony-models';

// ❌ Bad
import { ProfileService } from '../../../libs/shared-services/src';
```

---

**Setup completed!** Your Matrimony SaaS monorepo is ready for development. 🚀
