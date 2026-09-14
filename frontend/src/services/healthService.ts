import { api } from "./api";

type HealthResponse = {
    message: string
}

export async function getHealth(): Promise<HealthResponse> {
    const response = await api.get<HealthResponse>("/health")

    return response.data
}