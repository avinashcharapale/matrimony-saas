import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { TenantService } from '../../services/tenant.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [IonicModule, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {
  readonly tenant = inject(TenantService).tenant;
}
