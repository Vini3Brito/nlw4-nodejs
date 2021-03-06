import { AppError } from './../errors/AppError';
import { Request, Response } from 'express';
import { resolve } from 'path';
import { getCustomRepository } from 'typeorm';
import SendMailService from '../services/SendMailService';
import { SurveysRepository } from './../repositories/SurveysRepository';
import { SurveysUsersRepository } from './../repositories/SurveysUsersRepository';
import { UsersRepository } from './../repositories/UsersRepository';

export class SendMailController {

    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUserRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({email});

        if (!user) {
            throw new AppError("User does not exists!");
        }
        
        const survey = await surveysRepository.findOne({id: survey_id});

        if (!survey) {
            throw new AppError("Survey does not exists!");
        }
        
        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            surveyuser_id: "",
            link: process.env.URL_MAIL,
        }

        const surveyUserAlreadyExists = await surveysUserRepository.findOne({
            where: { user_id: user.id, value: null },
            relations: ["user", "survey"],
        });

        if (surveyUserAlreadyExists) {
            variables.surveyuser_id = surveyUserAlreadyExists.id;
            await SendMailService.execute(email, survey.title, variables, npsPath);
            return response.json(surveyUserAlreadyExists);
        }

        const surveyUser = surveysUserRepository.create({
            user_id: user.id,
            survey_id
        });
        await surveysUserRepository.save(surveyUser);

        variables.surveyuser_id = surveyUser.id;

        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);
    }


    // async create(request: Request, response: Response){
    //     const { title, description } = request.body;

    //     const surveysRepository = getCustomRepository(SurveysRepository);

    //     const survey = surveysRepository.create({
    //         title,
    //         description
    //     });

    //     await surveysRepository.save(survey);

    //     return response.status(201).json(survey);
    // }
    
    // async show(request: Request, response: Response){
    //     const surveysRepository = getCustomRepository(SurveysRepository);

    //     const all = await surveysRepository.find();

    //     return response.status(200).json(all);
    // }
}