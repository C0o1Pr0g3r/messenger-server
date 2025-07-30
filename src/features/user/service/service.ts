import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { function as function_, taskEither } from "fp-ts";
import { Repository } from "typeorm";

import { Common, Create, Get } from "./ios";

import { NotFoundError, UniqueKeyViolationError } from "~/app";
import { UnexpectedError } from "~/common";
import * as domain from "~/domain";
import { Config, Typeorm } from "~/infra";

@Injectable()
class UserService {
  constructor(
    private readonly configService: ConfigService<Config.Config, true>,
    @InjectRepository(Typeorm.Model.User)
    private readonly userRepository: Repository<Typeorm.Model.User>,
  ) {}

  create({
    password,
    ...rest
  }: Create.In): taskEither.TaskEither<UnexpectedError | UniqueKeyViolationError, Common.Out> {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          bcrypt.hash(
            password,
            this.configService.get("bcrypt", {
              infer: true,
            }).roundsForPasswordHash,
          ),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap((passwordHash) =>
        function_.pipe(
          taskEither.tryCatch(
            () =>
              this.userRepository.save(
                Object.assign(this.userRepository.create(), {
                  ...rest,
                  passwordHash,
                } satisfies Partial<ReturnType<typeof this.userRepository.create>>),
              ),
            (reason) => {
              if (
                Typeorm.isUniqueViolationError(reason) &&
                reason.driverError.constraint === Typeorm.Model.USER_META.constraints.email
              )
                return new UniqueKeyViolationError(domain.User.Constraint.UNIQUE_USER_EMAIL);

              return new UnexpectedError(reason);
            },
          ),
        ),
      ),
    );
  }

  get({
    email,
    password,
  }: Get.In): taskEither.TaskEither<UnexpectedError | NotFoundError, Common.Out> {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.userRepository.findOneBy({
            email,
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
      taskEither.flatMap((user) =>
        function_.pipe(
          () => bcrypt.compare(password, user.passwordHash),
          taskEither.fromTask,
          taskEither.flatMap((arePasswordsEqual) =>
            arePasswordsEqual ? taskEither.right(user) : taskEither.left(new NotFoundError()),
          ),
        ),
      ),
    );
  }
}

export { UserService };
