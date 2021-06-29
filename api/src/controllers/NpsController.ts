import { getCustomRepository, Not, IsNull } from 'typeorm';
import { SurveysUsersRepository } from './../repositories/SurveysUsersRepository';
import { Request, Response } from "express";

export default class NpsController {
    async execute (req: Request, res: Response) {
        const { survey_id } = req.params;
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const surveysUsers = await surveysUsersRepository.find({
            survey_id,
            value: Not(IsNull()),
        })

        const detractors = surveysUsers.filter(x => x.value >= 1 && x.value <= 6).length;
        const promoters = surveysUsers.filter(x => x.value >= 9 && x.value <= 10).length;
        const passives = surveysUsers.filter(x => x.value >= 7 && x.value <= 8).length;
        const answers = surveysUsers.filter(x => x.value >= 1 && x.value <= 10).length;

        const calculate = Number((((promoters - detractors) / answers) * 100).toFixed(2));

        return res.json({
            detractors,
            promoters,
            passives,
            answers,
            nps: calculate,
        })
    }
}