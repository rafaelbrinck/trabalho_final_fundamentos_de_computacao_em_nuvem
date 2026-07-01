import { Routes } from '@angular/router';

import { PetFormComponent } from './features/pets/pet-form/pet-form.component';
import { PetListComponent } from './features/pets/pet-list/pet-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'pets', pathMatch: 'full' },
  { path: 'pets', component: PetListComponent },
  { path: 'pets/novo', component: PetFormComponent },
  { path: 'pets/:id/editar', component: PetFormComponent },
  { path: '**', redirectTo: 'pets' },
];
