import { config } from "dotenv";
import { expand } from "dotenv-expand";
import { either } from "fp-ts";
import { DataSource } from "typeorm";

import { createConfig } from "../../config";

import { defineOptions } from "./options";

expand(config());

const eitherConfig = createConfig(process.env);
if (either.isLeft(eitherConfig)) throw eitherConfig.left;

const instance = new DataSource(defineOptions(eitherConfig.right.database));

export { instance };
