import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

//entry
import { Account, Profile, Provider } from "@entity";

interface PostgresConfig {
  type: "postgres";
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get<PostgresConfig>("database.postgres");

        return {
          ...dbConfig,
          entities: [Profile, Account, Provider],
          synchronize: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
