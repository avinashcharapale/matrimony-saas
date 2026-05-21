import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface UserSettings {
  profileVisibility: 'all' | 'verified' | 'matches';
  emailAlerts: boolean;
  smsAlerts: boolean;
  eventReminders: boolean;
}

const SETTINGS_KEY = 'matrimony_user_settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-shell">
      <header class="page-header">
        <p class="eyebrow">Preferences</p>
        <h1>Settings</h1>
      </header>

      <form class="settings-form" (ngSubmit)="save()">
        <label>
          Profile Visibility
          <select [(ngModel)]="settings.profileVisibility" name="profileVisibility">
            <option value="all">Visible to all members</option>
            <option value="verified">Only verified profiles</option>
            <option value="matches">Only suggested matches</option>
          </select>
        </label>

        <label><input type="checkbox" [(ngModel)]="settings.emailAlerts" name="emailAlerts" /> Email alerts</label>
        <label><input type="checkbox" [(ngModel)]="settings.smsAlerts" name="smsAlerts" /> SMS alerts</label>
        <label><input type="checkbox" [(ngModel)]="settings.eventReminders" name="eventReminders" /> Event reminders</label>

        <button type="submit">Save Settings</button>
        @if (savedMessage) {
        <p class="saved">{{ savedMessage }}</p>
        }
      </form>
    </section>
  `,
  styles: [
    `
      .page-shell { width: min(100%, 760px); margin: 0 auto; display: grid; gap: 1rem; }
      .page-header, .settings-form { background: #fff; border: 1px solid #eadfd7; border-radius: 1rem; padding: 1rem; }
      .eyebrow { margin: 0; color: #9a5e45; text-transform: uppercase; font-size: 0.74rem; font-weight: 700; }
      h1 { margin: 0.35rem 0 0; color: #24283a; }
      .settings-form { display: grid; gap: 0.8rem; }
      label { color: #363d52; font-weight: 600; display: grid; gap: 0.35rem; }
      select { border: 1px solid #dcc8bc; border-radius: 0.6rem; padding: 0.55rem; }
      input[type='checkbox'] { margin-right: 0.45rem; }
      button { width: fit-content; border: none; border-radius: 0.6rem; background: #9a5e45; color: #fff; font-weight: 700; padding: 0.6rem 0.95rem; }
      .saved { margin: 0; color: #1f7c3d; font-weight: 700; }
    `,
  ],
})
export class Settings {
  savedMessage = '';
  settings: UserSettings = {
    profileVisibility: 'verified',
    emailAlerts: true,
    smsAlerts: false,
    eventReminders: true,
  };

  constructor() {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      this.settings = { ...this.settings, ...(JSON.parse(raw) as Partial<UserSettings>) };
    }
  }

  save(): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    this.savedMessage = 'Settings saved successfully.';
  }
}
