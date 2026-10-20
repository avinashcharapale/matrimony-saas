import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit, signal } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AuthStore } from '@org/data-access-auth';
import { MatchClient, ProfileClient, ProfileShortlistDto, ProfileViewDto } from '@org/generated';

interface ShortlistCard {
  id: number;
  otherProfileId: number;
  name: string;
  date: string;
  isSaved: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-shortlists',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './shortlists.html',
  styleUrl: './shortlists.css',
})
export class Shortlists implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly matchClient = inject(MatchClient);
  private readonly profileClient = inject(ProfileClient);

  currentTab = signal<'saved' | 'viewed'>('saved');
  readonly savedCards = signal<ShortlistCard[]>([]);
  readonly viewedCards = signal<ShortlistCard[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly busyId = signal<number | null>(null);

  readonly savedCount = () => this.savedCards().length;
  readonly viewedCount = () => this.viewedCards().length;

  private myProfileId = 0;

  ngOnInit(): void {
    if (!this.authStore.isAuthenticated()) return;
    const userId = this.authStore.userId();
    if (!userId) {
      this.errorMessage.set('Please sign in to view shortlists.');
      this.isLoading.set(false);
      return;
    }

    this.profileClient.getMyProfile().subscribe({
      next: (profile) => {
        const pid = (profile as Record<string, unknown>)['profileId'] ?? (profile as Record<string, unknown>)['userId'];
        this.myProfileId = Number(pid ?? userId);
        this.loadData();
      },
      error: () => {
        this.errorMessage.set('Could not load your profile.');
        this.isLoading.set(false);
      },
    });
  }

  switchTab(tab: 'saved' | 'viewed'): void {
    this.currentTab.set(tab);
  }

  removeSaved(card: ShortlistCard): void {
    if (this.busyId()) return;
    this.busyId.set(card.id);
    this.matchClient.deleteShortlist(card.id).subscribe({
      next: () => {
        this.savedCards.update((cards) => cards.filter((c) => c.id !== card.id));
        this.busyId.set(null);
      },
      error: () => this.busyId.set(null),
    });
  }

  private loadData(): void {
    if (!this.myProfileId) {
      this.errorMessage.set('Could not load your profile.');
      this.isLoading.set(false);
      return;
    }

    forkJoin({
      saved: this.matchClient.getShortlistsByProfile(this.myProfileId),
      viewed: this.matchClient.getViewsByViewed(this.myProfileId),
    })
      .pipe(
        switchMap(({ saved, viewed }) => {
          const profileIds = new Set<number>();
          saved.forEach((s) => {
            const id = s.targetProfileId;
            if (id) profileIds.add(id);
          });
          viewed.forEach((v) => {
            const id = v.viewerProfileId;
            if (id) profileIds.add(id);
          });

          if (profileIds.size === 0) {
            return of({ saved, viewed, nameMap: new Map<number, string>() });
          }

          const nameCalls = Array.from(profileIds).map((pid) =>
            this.profileClient.getPublicProfileById(pid).pipe(
              map((p) => {
                const profile = p as Record<string, unknown>;
                const name =
                  (profile['fullName'] as string) ??
                  (profile['name'] as string) ??
                  (profile['profileCode'] as string) ??
                  (profile['firstName'] as string) ??
                  'Unknown';
                return { pid, name };
              }),
            ),
          );

          return forkJoin(nameCalls).pipe(
            map((results) => {
              const nameMap = new Map<number, string>();
              results.forEach(({ pid, name }) => nameMap.set(pid, name));
              return { saved, viewed, nameMap };
            }),
          );
        }),
      )
      .subscribe({
        next: ({ saved, viewed, nameMap }) => {
          this.savedCards.set(saved.map((s) => this.mapSaved(s, nameMap)));
          this.viewedCards.set(viewed.map((v) => this.mapViewed(v, nameMap)));
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Could not load data.');
          this.isLoading.set(false);
        },
      });
  }

  private mapSaved(s: ProfileShortlistDto, nameMap: Map<number, string>): ShortlistCard {
    const otherId = s.targetProfileId ?? 0;
    const date = s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    return {
      id: s.shortlistId ?? 0,
      otherProfileId: otherId,
      name: nameMap.get(otherId) ?? 'Unknown',
      date,
      isSaved: true,
    };
  }

  private mapViewed(v: ProfileViewDto, nameMap: Map<number, string>): ShortlistCard {
    const otherId = v.viewerProfileId ?? 0;
    const date = v.viewedAt ? new Date(v.viewedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    return {
      id: v.viewId ?? 0,
      otherProfileId: otherId,
      name: nameMap.get(otherId) ?? 'Unknown',
      date,
      isSaved: false,
    };
  }

  profileLink(profileId: number): string {
    return `/profiles/${profileId}`;
  }
}