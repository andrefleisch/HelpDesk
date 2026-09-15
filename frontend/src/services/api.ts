import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
})

// antes de cada requisição feita com api, execute essa função
api.interceptors.request.use((config) => {
  // config é o objeto de configuração da requisição, e contém coisas como url, method, headers, body/data, params, baseURL
  const token = localStorage.getItem("helpdesk.token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// depois de cada resposta com erro, verifica se a sessão autenticada deixou de ser válida
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const token = localStorage.getItem("helpdesk.token")
    const isLoginRequest = error.config?.url === "/auth/login"

    // remove o token expirado e reinicia a aplicação na tela de login
    if (error.response?.status === 401 && token && !isLoginRequest) {
      localStorage.removeItem("helpdesk.token")
      window.location.assign("/login")
    }

    // mantém o erro rejeitado para que o catch de quem fez a requisição também possa tratá-lo
    return Promise.reject(error)
  },
)
