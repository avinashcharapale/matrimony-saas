import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UsersClient, UserDetailDto, UserListDto, CreateUserRequestDto, UpdateUserRequestDto } from '@org/generated';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private readonly users = inject(UsersClient);

  getById(id: number): Observable<UserDetailDto> {
    return this.users.getById(id);
  }

  getByTenant(tenantId: number): Observable<UserListDto[]> {
    return this.users.getByTenant(tenantId);
  }

  create(body: CreateUserRequestDto): Observable<void> {
    return this.users.create(body);
  }

  update(id: number, body: UpdateUserRequestDto): Observable<void> {
    return this.users.update(id, body);
  }

  delete(id: number): Observable<void> {
    return this.users.delete(id);
  }
}
