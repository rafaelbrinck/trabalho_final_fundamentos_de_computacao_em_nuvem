import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CreatePetDto, Pet, UpdatePetDto } from '../models/pet.model';

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/pets';

  async getAll(): Promise<Pet[]> {
    return firstValueFrom(this.http.get<Pet[]>(this.apiUrl));
  }

  async getById(id: string): Promise<Pet> {
    return firstValueFrom(this.http.get<Pet>(`${this.apiUrl}/${id}`));
  }

  async create(dto: CreatePetDto): Promise<Pet> {
    return firstValueFrom(this.http.post<Pet>(this.apiUrl, dto));
  }

  async update(dto: UpdatePetDto): Promise<Pet> {
    const { id, ...body } = dto;
    return firstValueFrom(this.http.put<Pet>(`${this.apiUrl}/${id}`, body));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }
}
