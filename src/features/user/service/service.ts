import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { apply, function as function_, taskEither } from "fp-ts";
import { ILike, Repository } from "typeorm";

import { Common, Create, Get, GetByEmailOrNickname, GetById, UpdateMe } from "./ios";

import { NotFoundError, UniqueKeyViolationError } from "~/app";
import { Fp, UnexpectedError } from "~/common";
import * as domain from "~/domain";
import { BlobService } from "~/features/blob/service";
import { Config, Typeorm } from "~/infra";

@Injectable()
class UserService {
  constructor(
    private readonly configService: ConfigService<Config.Config, true>,
    @InjectRepository(Typeorm.Model.User)
    private readonly userRepository: Repository<Typeorm.Model.User>,
    private readonly blobService: BlobService,
  ) {}

  create({
    password,
    avatar,
    ...params
  }: Create.In): taskEither.TaskEither<UnexpectedError | UniqueKeyViolationError, Common.Out> {
    return function_.pipe(
      apply.sequenceS(taskEither.ApplyPar)({
        avatar: function_.pipe(
          avatar,
          taskEither.fromPredicate(
            (avatar): avatar is string => typeof avatar === "string",
            (avatar) => avatar,
          ),
          taskEither.orElse((avatar) =>
            avatar instanceof File ? this.blobService.upload(avatar) : taskEither.right(null),
          ),
        ),
        passwordHash: this.hashPassword(password),
      }),
      taskEither.flatMap(({ avatar, passwordHash }) =>
        function_.pipe(
          taskEither.tryCatch(
            () =>
              this.userRepository.save(
                Object.assign(this.userRepository.create(), {
                  ...params,
                  avatar,
                  passwordHash,
                } satisfies Partial<ReturnType<typeof this.userRepository.create>>),
              ),
            (reason) => {
              if (
                Typeorm.isUniqueKeyViolationError(reason) &&
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
          this.doesPasswordMatchHash(password, user.passwordHash),
          taskEither.flatMap((arePasswordsEqual) =>
            arePasswordsEqual ? taskEither.right(user) : taskEither.left(new NotFoundError()),
          ),
        ),
      ),
    );
  }

  getById({ id }: GetById.In): taskEither.TaskEither<UnexpectedError | NotFoundError, Common.Out> {
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.userRepository.findOneBy({
            id,
          }),
        (reason) => new UnexpectedError(reason),
      ),
      taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
    );
  }

  getByEmailOrNickname({
    emailOrNickname,
  }: GetByEmailOrNickname.In): taskEither.TaskEither<UnexpectedError, GetByEmailOrNickname.Out> {
    const baseWhere: NonNullable<Parameters<typeof this.userRepository.find>[0]>["where"] = {
      isPrivate: false,
    };
    const likeArg = ILike(`${Typeorm.escapeLikeArgument(emailOrNickname)}%`);
    return function_.pipe(
      taskEither.tryCatch(
        () =>
          this.userRepository.find({
            where: [
              {
                ...baseWhere,
                nickname: likeArg,
              },
              {
                ...baseWhere,
                email: likeArg,
              },
            ],
          }),
        (reason) => new UnexpectedError(reason),
      ),
    );
  }

  updateMe({
    id,
    ...params
  }: UpdateMe.In): taskEither.TaskEither<
    UnexpectedError | NotFoundError | UniqueKeyViolationError,
    Common.Out
  > {
    return function_.pipe(
      function_.pipe(
        params.withPassword
          ? function_.pipe(
              taskEither.tryCatch(
                () =>
                  this.userRepository.findOneBy({
                    id,
                  }),
                (reason) => new UnexpectedError(reason),
              ),
              taskEither.flatMap(taskEither.fromNullable(new NotFoundError())),
              taskEither.flatMap(({ passwordHash }) =>
                function_.pipe(
                  this.doesPasswordMatchHash(params.currentPassword, passwordHash),
                  taskEither.flatMap(
                    taskEither.fromPredicate(
                      (comparisonResult) => comparisonResult,
                      () => new NotFoundError(),
                    ),
                  ),
                  taskEither.flatMap(() => this.hashPassword(params.newPassword)),
                ),
              ),
              taskEither.map((passwordHash) => {
                const { withPassword, currentPassword, newPassword, ...rest } = params;
                return {
                  passwordHash,
                  ...rest,
                };
              }),
            )
          : taskEither.right(
              Fp.iife(() => {
                const { withPassword, ...rest } = params;
                return rest;
              }),
            ),
      ),
      taskEither.flatMap((dataForUpdate) =>
        function_.pipe(
          taskEither.tryCatch(
            () =>
              this.userRepository.save(
                Object.assign(this.userRepository.create(), {
                  id,
                  ...dataForUpdate,
                }),
              ),
            (reason) => {
              if (
                Typeorm.isUniqueKeyViolationError(reason) &&
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

  private hashPassword(password: domain.User.Schema["password"]) {
    return taskEither.tryCatch(
      () =>
        bcrypt.hash(
          password,
          this.configService.get("bcrypt", {
            infer: true,
          }).roundsForPasswordHash,
        ),
      (reason) => new UnexpectedError(reason),
    );
  }

  private doesPasswordMatchHash(
    password: domain.User.Schema["password"],
    hash: domain.User.Schema["passwordHash"],
  ) {
    return function_.pipe(
      taskEither.tryCatch(
        () => bcrypt.compare(password, hash),
        (reason) => new UnexpectedError(reason),
      ),
    );
  }
}

export { UserService };
