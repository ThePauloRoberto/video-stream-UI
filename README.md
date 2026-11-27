# VideoStream UI — Angular 17+ & Native Federation

Frontend em **Angular 17+** estruturado em **Micro Front-Ends (Native Federation)** com **Standalone Components** e **Signals**, integrado à API `video-stream-api` (`http://localhost:8080`).

## Arquitetura dos 3 Projetos

| Projeto | Porta | Papel | Módulos Expostos / Consumidos |
|---|---|---|---|
| **`shell`** | `4200` | Container Host com barra de navegação e roteamento dinâmico | Carrega `mfe-catalog` e `mfe-player` via `federation.manifest.json` + `loadRemoteModule` |
| **`mfe-catalog`** | `4201` | Consome `GET /api/v1/videos` (e `POST /api/videos/upload`) e exibe grid de cards com Signals | Expõe `./Component` (`CatalogComponent`) e `./Routes` (`CATALOG_ROUTES`) |
| **`mfe-player`** | `4202` | Recebe `:id` na rota e renderiza `<video controls>` apontando para `http://localhost:8080/api/v1/videos/{id}/stream` | Expõe `./Component` (`VideoPlayerComponent`) e `./Routes` (`PLAYER_ROUTES`) |

## Como executar

```powershell
cd "c:\Users\paulo\OneDrive\Documentos\projetos\video stream\video-stream-UI"

# 1. Instalar as dependências
npm install

# 2. Subir os 3 projetos simultaneamente (4201, 4202 e 4200)
npm start
```

Depois acesse o **Shell** em: `http://localhost:4200`
