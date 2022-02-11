export interface DeleteUserUseCase {
  invoke: (id: string | number) => Promise<void>;
}
