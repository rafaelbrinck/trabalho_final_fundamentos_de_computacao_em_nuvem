import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { EspeciePet, SexoPet } from '../../../models/pet.model';
import { PetService } from '../../../services/pet.service';

@Component({
  selector: 'app-pet-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './pet-form.component.html',
})
export class PetFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly petService = inject(PetService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly especies = Object.values(EspeciePet);
  protected readonly sexos = Object.values(SexoPet);
  protected readonly loading = signal(false);
  protected readonly loadingPet = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly submitted = signal(false);
  protected readonly isEditMode = signal(false);

  private petId: string | null = null;

  protected readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    data_nascimento: ['', Validators.required],
    especie: [EspeciePet.Cachorro, Validators.required],
    raca: ['', [Validators.required, Validators.minLength(2)]],
    sexo: [SexoPet.Macho, Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode.set(true);
      this.petId = id;
      void this.loadPet(id);
    }
  }

  protected get pageTitle(): string {
    return this.isEditMode() ? 'Editar pet' : 'Novo pet';
  }

  protected get submitLabel(): string {
    if (this.loading()) {
      return 'Salvando...';
    }

    return this.isEditMode() ? 'Atualizar' : 'Cadastrar';
  }

  protected isInvalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || this.submitted());
  }

  protected getErrorMessage(controlName: keyof typeof this.form.controls): string {
    const control = this.form.controls[controlName];

    if (control.hasError('required')) {
      return 'Campo obrigatório.';
    }

    if (control.hasError('minlength')) {
      return 'Informe pelo menos 2 caracteres.';
    }

    return 'Valor inválido.';
  }

  protected async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.form.getRawValue();

    try {
      if (this.isEditMode() && this.petId) {
        await this.petService.update({ id: this.petId, ...formValue });
      } else {
        await this.petService.create(formValue);
      }

      await this.router.navigate(['/pets']);
    } catch (error) {
      console.error('Erro ao salvar pet:', error);
      const action = this.isEditMode() ? 'atualizar' : 'cadastrar';
      this.errorMessage.set(this.getConnectionErrorMessage(error, action));
    } finally {
      this.loading.set(false);
    }
  }

  private async loadPet(id: string): Promise<void> {
    this.loadingPet.set(true);
    this.errorMessage.set(null);

    try {
      const pet = await this.petService.getById(id);

      this.form.patchValue({
        nome: pet.nome,
        data_nascimento: pet.data_nascimento,
        especie: pet.especie,
        raca: pet.raca,
        sexo: pet.sexo,
      });
    } catch (error) {
      console.error('Erro ao carregar pet:', error);

      const httpError = error as HttpErrorResponse;

      if (httpError.status === 0) {
        this.errorMessage.set(
          'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3000.',
        );
        return;
      }

      this.errorMessage.set('Pet não encontrado.');
      await this.router.navigate(['/pets']);
    } finally {
      this.loadingPet.set(false);
    }
  }

  private getConnectionErrorMessage(error: unknown, action: string): string {
    const httpError = error as HttpErrorResponse;

    if (httpError.status === 0) {
      return 'Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3000.';
    }

    return `Não foi possível ${action} o pet. Tente novamente.`;
  }
}
