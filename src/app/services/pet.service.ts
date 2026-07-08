import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CreatePetDto, Pet, UpdatePetDto } from '../models/pet.model';

@Injectable({ providedIn: 'root' })
export class PetService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/pets';

  getAll(): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.apiUrl);
  }

  getById(id: string): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreatePetDto): Observable<Pet> {
    return this.http.post<Pet>(this.apiUrl, dto);
  }

  update(dto: UpdatePetDto): Observable<Pet> {
    const { id, ...body } = dto;
    return this.http.put<Pet>(`${this.apiUrl}/${id}`, body);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
