require("dotenv").config();

import express from "express";
import RatedEntityController from "./controllers/rankedEntityController";
import ResultController from "./controllers/resultController";

import bodyParser from "body-parser";

import config from "./config/config";
import logging from "./config/logging";

import mongoose from "mongoose";
import { RatedEntity } from "./models";

const NAMESPACE = "Server";
const router = express();

class Server {
    constructor() {
        // Connect to Mongo
        mongoose
            .connect(config.databaseUrl, config.mongoOptions)
            .then((result) => {
                logging.info(NAMESPACE, "Connected to MongoDB");
            })
            .catch((error) => {
                logging.error(NAMESPACE, error.message, error);
            });

        // Request logging
        router.use((req, res, next) => {
            logging.info(NAMESPACE, `[${req.method}] '${req.url}' - IP: [${req.socket.remoteAddress}]`);

            res.on("finish", () => {
                logging.info(
                    NAMESPACE,
                    `[${req.method}] '${req.url}' - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
                );
            });

            next();
        });

        // Request body parsing
        router.use(bodyParser.urlencoded({ extended: true }));
        router.use(bodyParser.json());

        // Routes
        router.get("/users", RatedEntityController.allUsers);
        router.get("/users/:id", RatedEntityController.getUser);
        router.post("/users/:id", RatedEntityController.createUser);

        router.get("/maps", RatedEntityController.allMaps);
        router.get("/maps/:id", RatedEntityController.getMap);
        router.post("/maps/:id", RatedEntityController.createMap);

        router.get("/results", ResultController.allResults);
        router.get("/results/:id", ResultController.getResult);
        router.get("/results/user/:id", ResultController.getUserResults);
        router.get("/results/map/:id", ResultController.getMapResults);
        router.post("/results/", ResultController.createResult);

        router.listen(config.port, () => logging.info(NAMESPACE, `Server is running on port ${config.port}`));
    }
}

new Server();
