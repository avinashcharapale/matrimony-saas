import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="landing">
      <header class="hero">
        <nav class="nav">
          <div class="logo">Matrimony</div>
          <div class="nav-links">
            <a routerLink="/features">Features</a>
            <a routerLink="/pricing">Pricing</a>
            <a href="/login">Login</a>
          </div>
        </nav>
        <div class="hero-content">
          <h1>Find Your Perfect Life Partner</h1>
          <p>Trusted by thousands of families. Verified profiles, secure matchmaking.</p>
          <div class="hero-actions">
            <a href="/register" class="btn-primary">Get Started</a>
            <a routerLink="/features" class="btn-secondary">Learn More</a>
          </div>
        </div>
      </header>
      <section class="features-preview">
        <div class="feature">
          <h3>Verified Profiles</h3>
          <p>Every profile is verified for authenticity and trust.</p>
        </div>
        <div class="feature">
          <h3>Smart Matching</h3>
          <p>AI-powered recommendations based on your preferences.</p>
        </div>
        <div class="feature">
          <h3>Secure & Private</h3>
          <p>Your data is encrypted and never shared without consent.</p>
        </div>
      </section>
      <footer class="footer">
        <p>&copy; 2026 Matrimony. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .nav { display: flex; justify-content: space-between; align-items: center; padding: 1rem 2rem; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-size: 1.5rem; font-weight: bold; color: #1976d2; }
    .nav-links a { margin-left: 1.5rem; text-decoration: none; color: #333; }
    .hero { background: linear-gradient(135deg, #1976d2, #7b1fa2); color: white; padding: 4rem 2rem; text-align: center; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .hero p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
    .hero-actions { display: flex; gap: 1rem; justify-content: center; }
    .btn-primary { padding: 0.75rem 2rem; background: white; color: #1976d2; border-radius: 8px; text-decoration: none; font-weight: bold; }
    .btn-secondary { padding: 0.75rem 2rem; border: 2px solid white; color: white; border-radius: 8px; text-decoration: none; }
    .features-preview { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; padding: 4rem 2rem; max-width: 1000px; margin: 0 auto; }
    .feature { text-align: center; padding: 2rem; }
    .feature h3 { color: #1976d2; margin-bottom: 0.5rem; }
    .footer { text-align: center; padding: 2rem; background: #f5f5f5; color: #666; }
  `],
})
export class Home {}
