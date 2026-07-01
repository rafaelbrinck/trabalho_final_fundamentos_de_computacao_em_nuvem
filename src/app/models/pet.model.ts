export enum EspeciePet {
  Cachorro = 'Cachorro',
  Gato = 'Gato',
  Roedor = 'Roedor',
  Reptil = 'Réptil',
  Ave = 'Ave',
  Outros = 'Outros',
}

export enum SexoPet {
  Macho = 'Macho',
  Femea = 'Fêmea',
}

export interface Pet {
  id: string;
  nome: string;
  data_nascimento: string;
  especie: EspeciePet;
  raca: string;
  sexo: SexoPet;
}

export type CreatePetDto = Omit<Pet, 'id'>;

export type UpdatePetDto = Pet;
