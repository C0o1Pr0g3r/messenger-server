import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm";

class LifeCycleDates {
  @CreateDateColumn({
    type: "timestamp",
    name: "created_at",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    name: "updated_at",
  })
  updatedAt!: Date;

  @DeleteDateColumn({
    type: "timestamp",
    name: "deleted_at",
  })
  deletedAt!: Date | null;
}

export { LifeCycleDates };
