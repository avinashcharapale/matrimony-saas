import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from '@org/shared-ui';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, LoaderComponent],
  template: `<ui-loader></ui-loader><router-outlet></router-outlet>`,
})
export class App {}
