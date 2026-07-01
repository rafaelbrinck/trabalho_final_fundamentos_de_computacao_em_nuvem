import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';

import { CreatePetDto, EspeciePet, Pet, SexoPet, UpdatePetDto } from '../models/pet.model';

const NETWORK_DELAY_MS = 400;

@Injectable({ providedIn: 'root' })
export class PetService {
  private pets: Pet[] = [
    {
      id: '1',
      nome: 'Rex',
      data_nascimento: '2020-03-15',
      especie: EspeciePet.Cachorro,
      raca: 'Labrador',
      sexo: SexoPet.Macho,
    },
    {
      id: '2',
      nome: 'Mimi',
      data_nascimento: '2022-07-08',
      especie: EspeciePet.Gato,
      raca: 'Siamês',
      sexo: SexoPet.Femea,
    },
    {
      id: '3',
      nome: 'Pipoca',
      data_nascimento: '2023-01-20',
      especie: EspeciePet.Ave,
      raca: 'Calopsita',
      sexo: SexoPet.Macho,
    },
  ];

  private nextId = 4;

  /**
   * Substitua por: return this.http.get<Pet[]>(`${apiUrl}/pets`)
   */
  getAll(): Observable<Pet[]> {
    return of([...this.pets]).pipe(delay(NETWORK_DELAY_MS));
  }

  /**
   * Substitua por: return this.http.get<Pet>(`${apiUrl}/pets/${id}`)
   */
  getById(id: string): Observable<Pet> {
    const pet = this.pets.find((item) => item.id === id);

    if (!pet) {
      return throwError(() => new Error(`Pet com id "${id}" não encontrado.`)).pipe(
        delay(NETWORK_DELAY_MS),
      );
    }

    return of({ ...pet }).pipe(delay(NETWORK_DELAY_MS));
  }

  /**
   * Substitua por: return this.http.post<Pet>(`${apiUrl}/pets`, dto)
   */
  create(dto: CreatePetDto): Observable<Pet> {
    const newPet: Pet = {
      id: String(this.nextId++),
      ...dto,
    };

    this.pets = [...this.pets, newPet];

    return of({ ...newPet }).pipe(delay(NETWORK_DELAY_MS));
  }

  /**
   * Substitua por: return this.http.put<Pet>(`${apiUrl}/pets/${dto.id}`, dto)
   */
  update(dto: UpdatePetDto): Observable<Pet> {
    const index = this.pets.findIndex((item) => item.id === dto.id);

    if (index === -1) {
      return throwError(() => new Error(`Pet com id "${dto.id}" não encontrado.`)).pipe(
        delay(NETWORK_DELAY_MS),
      );
    }

    this.pets = this.pets.map((item) => (item.id === dto.id ? { ...dto } : item));

    return of({ ...dto }).pipe(delay(NETWORK_DELAY_MS));
  }

  /**
   * Substitua por: return this.http.delete<void>(`${apiUrl}/pets/${id}`)
   */
  delete(id: string): Observable<void> {
    const index = this.pets.findIndex((item) => item.id === id);

    if (index === -1) {
      return throwError(() => new Error(`Pet com id "${id}" não encontrado.`)).pipe(
        delay(NETWORK_DELAY_MS),
      );
    }

    this.pets = this.pets.filter((item) => item.id !== id);

    return of(void 0).pipe(delay(NETWORK_DELAY_MS));
  }
}
