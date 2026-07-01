import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

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
  private readonly destroyRef = inject(DestroyRef);

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
      this.loadPet(id);
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
    return (control.invalid && (control.touched || this.submitted()));
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

  protected onSubmit(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.form.getRawValue();

    const request$ = this.isEditMode() && this.petId
      ? this.petService.update({ id: this.petId, ...formValue })
      : this.petService.create(formValue);

    request$
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.router.navigate(['/pets']),
        error: () =>
          this.errorMessage.set(
            this.isEditMode()
              ? 'Não foi possível atualizar o pet. Tente novamente.'
              : 'Não foi possível cadastrar o pet. Tente novamente.',
          ),
      });
  }

  private loadPet(id: string): void {
    this.loadingPet.set(true);
    this.errorMessage.set(null);

    this.petService
      .getById(id)
      .pipe(
        finalize(() => this.loadingPet.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pet) => {
          this.form.patchValue({
            nome: pet.nome,
            data_nascimento: pet.data_nascimento,
            especie: pet.especie,
            raca: pet.raca,
            sexo: pet.sexo,
          });
        },
        error: () => {
          this.errorMessage.set('Pet não encontrado.');
          this.router.navigate(['/pets']);
        },
      });
  }
}
