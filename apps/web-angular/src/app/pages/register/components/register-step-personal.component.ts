import { Component, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MasterDataService, MasterDataItem } from '../../../services/master-data.service';

@Component({
  selector: 'app-register-step-personal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register-step-personal.component.html',
  styleUrl: '../register.css',
})
export class RegisterStepPersonalComponent implements OnInit {
  @Input({ required: true }) vm!: any;

  private masterDataSvc = inject(MasterDataService);

  religionOptions: MasterDataItem[] = [];
  casteOptions: MasterDataItem[] = [];
  subCastOptions: MasterDataItem[] = [];

  async ngOnInit(): Promise<void> {
    const lookupData = await this.masterDataSvc.getMultiple(['religion', 'caste', 'sub_caste']);
    this.religionOptions = lookupData['religion'] ?? [];
    this.casteOptions = lookupData['caste'] ?? [];
    this.subCastOptions = lookupData['sub_caste'] ?? [];
  }
}
