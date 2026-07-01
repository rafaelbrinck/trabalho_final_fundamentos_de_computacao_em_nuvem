import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Pet } from '../../../models/pet.model';
import { PetService } from '../../../services/pet.service';

@Component({
  selector: 'app-pet-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './pet-list.component.html',
})
export class PetListComponent implements OnInit {
  private readonly petService = inject(PetService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pets = signal<Pet[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPets();
  }

  protected loadPets(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.petService
      .getAll()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pets) => this.pets.set(pets),
        error: () => this.errorMessage.set('Não foi possível carregar os pets. Tente novamente.'),
      });
  }

  protected deletePet(pet: Pet): void {
    const confirmed = confirm(`Deseja realmente excluir o pet "${pet.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.deletingId.set(pet.id);
    this.errorMessage.set(null);

    this.petService
      .delete(pet.id)
      .pipe(
        finalize(() => this.deletingId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.pets.update((current) => current.filter((item) => item.id !== pet.id)),
        error: () => this.errorMessage.set(`Não foi possível excluir o pet "${pet.nome}".`),
      });
  }

  protected isDeleting(petId: string): boolean {
    return this.deletingId() === petId;
  }
}
