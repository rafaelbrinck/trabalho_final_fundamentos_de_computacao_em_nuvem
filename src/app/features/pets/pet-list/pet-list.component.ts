import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Pet } from '../../../models/pet.model';
import { PetService } from '../../../services/pet.service';

@Component({
  selector: 'app-pet-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './pet-list.component.html',
})
export class PetListComponent implements OnInit {
  private readonly petService = inject(PetService);

  protected readonly pets = signal<Pet[]>([]);
  protected readonly loading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  ngOnInit(): void {
    void this.loadPets();
  }

  protected async loadPets(): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const pets = await this.petService.getAll();
      this.pets.set(pets);
    } catch (error) {
      console.error('Erro ao carregar pets:', error);
      this.errorMessage.set(this.getConnectionErrorMessage(error, 'carregar os pets'));
    } finally {
      this.loading.set(false);
    }
  }

  protected async deletePet(pet: Pet): Promise<void> {
    const confirmed = confirm(`Deseja realmente excluir o pet "${pet.nome}"?`);

    if (!confirmed) {
      return;
    }

    this.deletingId.set(pet.id);
    this.errorMessage.set(null);

    try {
      await this.petService.delete(pet.id);
      this.pets.update((current) => current.filter((item) => item.id !== pet.id));
    } catch (error) {
      console.error(`Erro ao excluir pet "${pet.nome}":`, error);
      this.errorMessage.set(
        this.getConnectionErrorMessage(error, `excluir o pet "${pet.nome}"`),
      );
    } finally {
      this.deletingId.set(null);
    }
  }

  protected isDeleting(petId: string): boolean {
    return this.deletingId() === petId;
  }

  private getConnectionErrorMessage(error: unknown, action: string): string {
    const httpError = error as HttpErrorResponse;

    if (httpError.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3000.';
    }

    return `Não foi possível ${action}. Tente novamente.`;
  }
}
