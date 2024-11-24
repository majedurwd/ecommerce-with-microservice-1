import { Express, Request, Response } from "express"
import axios from "axios"
import config from './config.json'

const createHandler = (hostName: string, path: string, method: string) => {
    return async (req: Request, res: Response) => {
        try {
            let url = `${hostName}${path}`
            // console.log(Object.keys(req.params))
            // console.log(req.params)
            req.params && Object.keys(req.params).forEach((param) => {
                // console.log(req.params[param])
                url = url.replace(`:${param}`, req.params[param])
            })
            const { data } = await axios({
                method,
                url,
                data: req.body,
                headers: {
                    origin: 'http://localhost:8081'
                }
            })
            res.json(data)
        } catch (error) {
            if (error instanceof axios.AxiosError) {
               return res.status(error.response?.status || 500).json(error.response?.data)
            }
            console.log(error)
            return res.status(500).json({message: 'Internal Server Error'})
        }
    }
}

export const configureRoutes = (app: Express) => {
    Object.entries(config.services).forEach(([_name ,service]) => {
        const hostName = service.url
        service.routes.forEach((route) => {
            route.methods.forEach((method) => {
                const handler = createHandler(hostName, route.path, method)
                const endPoints = `/api${route.path}`
                console.log(`Adding route ${method.toUpperCase()} ${endPoints}`)
                app[method](endPoints, handler)
            })
        })
    })
}