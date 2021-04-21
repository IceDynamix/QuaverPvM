import { ResultModel } from "../models/result";
import { Request, Response } from "express";
import ResponseHandler from "./response";
import config from "../config/config";

export default class ResultController {
    public static GET(req: Request, res: Response): void {
        const { id, entity, populate } = req.query;

        let method;
        if (id) method = ResultModel.find({ _id: id });
        else if (entity) method = ResultModel.findEntityResults(entity.toString());
        else method = ResultModel.find({});

        if (populate)
            ResponseHandler.handle(
                method
                    .populate("entity1")
                    .populate("entity2")
                    .exec(),
                res
            );
        else ResponseHandler.handle(method.exec(), res);
    }

    public static POST(req: Request, res: Response): void {
        res.header("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Origin", config.clientBaseUrl);
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        if (!req.user) {
            res.status(401).json({ message: "Not logged in" });
            return;
        }

        const entity1 = (req.user as any)._id;
        const { entity: entity2, result }: { entity: string; result: boolean } = req.body;
        if (!entity2) {
            res.status(500).json({ message: "Entity field was not set" });
            return;
        }

        ResponseHandler.handle(ResultModel.createNewResult(entity1, entity2, result), res, 201);
    }
}
