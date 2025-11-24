import { Resolver, Mutation } from '@nestjs/graphql';
import { DatabaseSeederService } from './database-seeder.service';

@Resolver()
export class DatabaseSeederResolver {
  constructor(private readonly seederService: DatabaseSeederService) {}

  @Mutation(() => String, {
    description: 'Seed the database with initial data',
  })
  async seedDatabase(): Promise<string> {
    await this.seederService.seed();
    return 'Database seeded successfully';
  }
}
