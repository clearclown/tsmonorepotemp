# TypeScript Mono repo template

## 技術選定
* モノレポ管理ツール: Nx21
* テスト : Vitest
* フロントエンド :
  * Vite
  * React.js
  * TypeScript
  * Tanstack Router
  * Tanstack Form
  * Tanstack Query
  * Orval
  * Jotai
  * pnpm
  * PWAs(?)

* モバイル
  * Flutter

* バックエンド :
  * NestJS
   * pnpm
   * TypeScript
   * Express.js
   * pnpm

* インフラ :
  * デプロイ(優先度順，ただし，コスト効率，パフォーマンス効率などを重視するため，必ずしもこの通りではない．)
    1. GCP (Google Cloud)
    2. Cloud Flare
    3. AWS

  * 補助技術
    * Terraform
    * Kubernetes (K8s)

  * ローカル
    * Docker (Docker Composed)
    * Docker Compose (v2の`docker compose`コマンド)
    * CI/CD : GitHub Acctions

* テスト :
  * 単体テスト : Vitest
  * 結合テスト : Playwright

## インフラ構築手順

```sh
docker compose -f infra/docker/docker-compose.dev.yml up -d
docker compose -f infra/docker/docker-compose.dev.yml exec app bash
```
