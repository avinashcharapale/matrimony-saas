import { ChangeDetectorRef, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import {
  RegisterMasterDataService,
  RegisterLookupOption,
  RegisterIncomeRangeOption,
} from '../../../../services/register-master-data.service';

@Component({
  selector: 'app-register-step-expectation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, TranslateModule],
  templateUrl: './register-step-expectation.component.html',
  styleUrl: '../../register.css',
})
export class RegisterStepExpectationComponent implements OnInit, OnDestroy {
  @Input({ required: true }) form!: FormGroup;
  @Output() photoSelected = new EventEmitter<Event>();
  @Output() photo2Selected = new EventEmitter<Event>();
  @Output() refreshCaptcha = new EventEmitter<void>();

  private readonly masterData = inject(RegisterMasterDataService);
  private readonly cdr = inject(ChangeDetectorRef);
  private subs: Subscription[] = [];

  casteOptions: RegisterLookupOption[] = [];
  allCasteOptions: RegisterLookupOption[] = [];
  educationOptions: RegisterLookupOption[] = [];
  allEducationOptions: RegisterLookupOption[] = [];
  occupationOptions: RegisterLookupOption[] = [];
  allOccupationOptions: RegisterLookupOption[] = [];
  incomeRangeOptions: RegisterIncomeRangeOption[] = [];

  educationDropdownOpen = false;
  occupationDropdownOpen = false;
  casteDropdownOpen = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-select')) {
      this.educationDropdownOpen = false;
      this.occupationDropdownOpen = false;
      this.casteDropdownOpen = false;
    }
  }

  get partner(): FormGroup { return this.form.get('partnerPreference') as FormGroup; }
  get verification(): FormGroup { return this.form.get('verification') as FormGroup; }
  get account(): FormGroup { return this.form.get('account') as FormGroup; }
  get photos(): FormGroup { return this.form.get('photos') as FormGroup; }
  get preferredCitiesCtrl(): FormControl { return this.form.get('preferredCities') as FormControl; }
  get interestsCtrl(): FormControl { return this.form.get('interests') as FormControl; }

  ngOnInit(): void {
    const personal = this.form.get('personalDetails') as FormGroup;
    const religionId = personal.get('religionId')?.value;

    forkJoin({
      castes: this.masterData.getCastes(religionId || 0),
      educations: this.masterData.getEducations(),
      occupations: this.masterData.getOccupations(),
      incomeRanges: this.masterData.getIncomeRanges(),
    }).subscribe({
      next: (r) => {
        this.allCasteOptions = r.castes;
        this.allEducationOptions = r.educations;
        this.allOccupationOptions = r.occupations;
        this.incomeRangeOptions = r.incomeRanges;
        this.updateCasteOptions();
        this.updateEducationOptions();
        this.updateOccupationOptions();
      },
      complete: () => this.cdr.detectChanges(),
      error: () => this.cdr.detectChanges(),
    });

    this.subs.push(
      this.partner.get('expectedCasteNoBar')!.valueChanges.subscribe(() => this.updateCasteOptions()),
      this.partner.get('expectedEducationNoBar')!.valueChanges.subscribe(() => this.updateEducationOptions()),
      this.partner.get('expectedOccupationNoBar')!.valueChanges.subscribe(() => this.updateOccupationOptions()),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  onCasteMultiSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const values = Array.from(select.selectedOptions).map(o => Number(o.value)).filter(n => n > 0);
    this.partner.get('expectedCasteIds')!.setValue(values.join(','));
  }

  isCasteSelected(casteId: number): boolean {
    return this.getSelectedIds('expectedCasteIds').includes(casteId);
  }

  toggleCasteDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.casteDropdownOpen = !this.casteDropdownOpen;
    if (this.casteDropdownOpen) { this.educationDropdownOpen = false; this.occupationDropdownOpen = false; }
  }

  toggleCasteOption(id: number, event: Event): void {
    event.stopPropagation();
    const current = this.getSelectedIds('expectedCasteIds');
    const idx = current.indexOf(id);
    if (idx > -1) { current.splice(idx, 1); } else { current.push(id); }
    this.partner.get('expectedCasteIds')!.setValue(current.join(','));
  }

  getSelectedCasteLabels(): string[] {
    return this.casteOptions.filter(o => this.getSelectedIds('expectedCasteIds').includes(o.id)).map(o => o.label);
  }

  onEducationMultiSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const values = Array.from(select.selectedOptions).map(o => Number(o.value)).filter(n => n > 0);
    this.partner.get('expectedEducationIds')!.setValue(values.join(','));
  }

  isEducationSelected(educationId: number): boolean {
    return this.getSelectedIds('expectedEducationIds').includes(educationId);
  }

  onOccupationMultiSelect(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const values = Array.from(select.selectedOptions).map(o => Number(o.value)).filter(n => n > 0);
    this.partner.get('expectedOccupationIds')!.setValue(values.join(','));
  }

  isOccupationSelected(occupationId: number): boolean {
    return this.getSelectedIds('expectedOccupationIds').includes(occupationId);
  }

  toggleEducationDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.educationDropdownOpen = !this.educationDropdownOpen;
    if (this.educationDropdownOpen) this.occupationDropdownOpen = false;
  }

  toggleOccupationDropdown(event: MouseEvent): void {
    event.stopPropagation();
    this.occupationDropdownOpen = !this.occupationDropdownOpen;
    if (this.occupationDropdownOpen) this.educationDropdownOpen = false;
  }

  toggleEducationOption(id: number, event: Event): void {
    event.stopPropagation();
    const current = this.getSelectedIds('expectedEducationIds');
    const idx = current.indexOf(id);
    if (idx > -1) { current.splice(idx, 1); } else { current.push(id); }
    this.partner.get('expectedEducationIds')!.setValue(current.join(','));
  }

  toggleOccupationOption(id: number, event: Event): void {
    event.stopPropagation();
    const current = this.getSelectedIds('expectedOccupationIds');
    const idx = current.indexOf(id);
    if (idx > -1) { current.splice(idx, 1); } else { current.push(id); }
    this.partner.get('expectedOccupationIds')!.setValue(current.join(','));
  }

  getSelectedEducationLabels(): string[] {
    return this.educationOptions.filter(o => this.getSelectedIds('expectedEducationIds').includes(o.id)).map(o => o.label);
  }

  getSelectedOccupationLabels(): string[] {
    return this.occupationOptions.filter(o => this.getSelectedIds('expectedOccupationIds').includes(o.id)).map(o => o.label);
  }

  onPhoto(event: Event): void { this.photoSelected.emit(event); }
  onPhoto2(event: Event): void { this.photo2Selected.emit(event); }
  onRefreshCaptcha(): void { this.refreshCaptcha.emit(); }

  appendComma(ctrl: FormControl): void {
    const val = (ctrl.value ?? '').toString().trim();
    if (val && !val.endsWith(',')) {
      ctrl.setValue(val + ', ', { emitEvent: false });
    }
  }

  getTags(ctrl: FormControl): string[] {
    const val = (ctrl.value ?? '').toString().trim();
    if (!val) return [];
    return val.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
  }

  onTagKeydown(event: KeyboardEvent, ctrl: FormControl): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addTagFromInput(ctrl, event);
    }
  }

  addTagFromInput(ctrl: FormControl, event?: Event): void {
    const input = ((event?.target) ?? (document.activeElement)) as HTMLInputElement;
    const text = (input?.value ?? '').trim().replace(/,/g, '');
    if (!text) return;
    const tags = this.getTags(ctrl);
    if (!tags.includes(text)) {
      tags.push(text);
      ctrl.setValue(tags.join(', '), { emitEvent: false });
    }
    if (input && input.tagName === 'INPUT') input.value = '';
  }

  removeTag(ctrl: FormControl, tag: string): void {
    const tags = this.getTags(ctrl).filter(t => t !== tag);
    ctrl.setValue(tags.join(', '), { emitEvent: false });
  }

  private getSelectedIds(field: string): number[] {
    const val = this.partner.get(field)?.value;
    if (!val) return [];
    return String(val).split(',').map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n) && n > 0);
  }

  private updateCasteOptions(): void {
    const noBar = this.partner.get('expectedCasteNoBar')?.value;
    this.casteOptions = noBar ? [] : this.allCasteOptions;
    if (noBar) {
      this.partner.get('expectedCasteIds')!.setValue('');
    }
  }

  private updateEducationOptions(): void {
    const noBar = this.partner.get('expectedEducationNoBar')?.value;
    this.educationOptions = noBar ? [] : this.allEducationOptions;
    if (noBar) {
      this.partner.get('expectedEducationIds')!.setValue('');
    }
  }

  private updateOccupationOptions(): void {
    const noBar = this.partner.get('expectedOccupationNoBar')?.value;
    this.occupationOptions = noBar ? [] : this.allOccupationOptions;
    if (noBar) {
      this.partner.get('expectedOccupationIds')!.setValue('');
    }
  }
}
