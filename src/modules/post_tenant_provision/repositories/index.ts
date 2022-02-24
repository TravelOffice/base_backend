// TODO: Declare repository objects which can be used in this service here

import TourRepositoryImpl from "./TourRepositoryImpl";
import { TourRepository } from "./interfaces/TourRepository";

interface Repositories {
  tourRepository: TourRepository,
}

const repositories : Repositories = {
  tourRepository: new TourRepositoryImpl(),
}

export const {
  tourRepository,
} = repositories;