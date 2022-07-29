import { Inject } from "@nestjs/common";
import {
  Args,
  Field,
  ID,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Subscription,
} from "@nestjs/graphql";
import { Message, PrismaService } from "database";
import { PubSub } from "graphql-subscriptions";

@ObjectType()
class Msg implements Message {
  @Field(() => ID)
  id: number;

  @Field(() => Date)
  createdAt: Date;
  @Field(() => Date)
  updatedAt: Date;
  @Field()
  text: string;
  @Field()
  author: string;

  constructor(message: Message) {
    Object.assign(this, message);
  }
}

@InputType("MessageInput")
class MessageInput implements Partial<Message> {
  @Field(() => Date, { nullable: true })
  createdAt?: Date;
  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
  @Field()
  text: string;
  @Field({ nullable: true })
  author?: string;

  constructor(message: Message) {
    Object.assign(this, message);
  }
}

@Resolver()
export class AppResolver {
  constructor(
    @Inject("PUB_SUB") private readonly pubSub: PubSub,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [Msg])
  allMessages() {
    return this.prisma.message.findMany();
  }

  @Mutation(() => Msg)
  async createMessage(
    @Args("payload", { type: () => MessageInput }) payload: MessageInput,
  ) {
    const message = await this.prisma.message.create({
      data: payload,
    });
    await this.pubSub.publish("newMessage", new Msg(message));
    await this.pubSub.publish("count", await this.prisma.message.count());
    return message;
  }

  @Subscription(() => Msg, {
    nullable: true,
    resolve: (payload) => payload,
  })
  newMessage() {
    return this.pubSub.asyncIterator("newMessage");
  }

  @Subscription(() => Number, {
    nullable: true,
    resolve: (payload) => payload,
  })
  messagesCount() {
    return this.pubSub.asyncIterator("count");
  }
}
