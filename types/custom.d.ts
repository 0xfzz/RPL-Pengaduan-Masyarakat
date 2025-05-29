import { NextApiRequest } from "next"
import { NextRequest } from "next/server"

interface CustomHeaders extends Headers {
    'x-user-role': string,
    'x-user-id': string
}
interface RequestCustomHeaders extends NextApiRequest {
    headers: CustomHeaders
}