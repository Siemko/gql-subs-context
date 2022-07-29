import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaService } from "database";
import { PubSub } from "graphql-subscriptions";
import { AppController } from "./app.controller";
import { AppResolver } from "./app.resolver";
import { AppService } from "./app.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      subscriptions: {
        "graphql-ws": {
          path: "/subscriptions",
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    AppResolver,
    {
      provide: "PUB_SUB",
      useValue: new PubSub(),
    },
  ],
})
export class AppModule {}
