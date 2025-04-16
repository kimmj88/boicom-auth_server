import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

//entry
import {
  Account,
  Cart,
  ChatMessage,
  ChatRoom,
  ChatUser,
  Post,
  PostComment,
  PostLike,
  Product,
  ProductDiscount,
  Profile,
  Provider,
} from '@entity';

interface PostgresConfig {
  type: 'postgres';
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
        const dbConfig = configService.get<PostgresConfig>('database.postgres');

        return {
          ...dbConfig,
          entities: [
            Profile,
            Account,
            Provider,
            Post,
            PostComment,
            PostLike,
            Cart,
            Product,
            ProductDiscount,
            ChatUser,
            ChatRoom,
            ChatMessage,
          ],
          synchronize: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
