# Vitest 環境で発生する NestJS の DI 問題を解消する実践ガイド（用語集付き）

NestJS を Vitest で単体テストすると、コンストラクタで注入されるはずの依存が `undefined` になり `TypeError` を引き起こすことがある。本稿はその**原因**と**最短の解決策**、そして**再発を防ぐチェックリスト**までを一気通貫で解説する。

---

## TL;DR（最短手順）

1. **SWC を導入**して Vitest のトランスパイルを esbuild から切り替える。
2. **デコレータとメタデータ出力**を SWC で有効化する（`legacyDecorator` / `decoratorMetadata`）。
3. ``** をテスト起動前に読み込む**。
4. Nest 標準のモック戦略（`TestingModule` + `useValue`）はそのまま使えばよい。

```bash
pnpm add -D unplugin-swc reflect-metadata
```

```ts
// backend/vitest.config.ts
import { defineConfig } from 'vitest/config'
import swc from 'unplugin-swc'
// Nx を使う場合はパス解決プラグインを併用可（任意）
// import nxViteTsPaths from '@nx/vite/plugins/nx-tsconfig-paths'
// もしくは Vite 素のプロジェクトなら
// import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    // nxViteTsPaths(),
    // tsconfigPaths(),
    swc.vite({
      jsc: {
        parser: { syntax: 'typescript', decorators: true, dynamicImport: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
        target: 'es2022',
      },
      module: { type: 'es6' },
    }),
  ],
  esbuild: false, // ← SWC を主導にする
  test: {
    environment: 'node',
    setupFiles: ['reflect-metadata'], // ← 反射メタデータを先に読み込む
    include: ['src/**/*.spec.ts'],
    // 必要に応じて: isolate: false,
  },
})
```

```jsonc
// tsconfig.json（抜粋）：Nest のビルドでもメタデータを出す
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

## 背景と原因

- **現象**: `AppController` の `this.appService` や、`AppService` の `this.prisma` が `undefined` になり `TypeError` を出す。
- **原因**: Vite/Vitest の既定トランスパイラである **esbuild** は TypeScript の**設計時型メタデータ（**``**）を出力しない**。NestJS の DI はこのメタデータを参照して依存を解決するため、情報がないと注入に失敗し、結果として `undefined` が渡る。対策は **SWC でメタデータを出力**させることに尽きる。

---

## 症状の例

```ts
// app.controller.ts（例）
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData() // ← appService が undefined だと TypeError
  }
}
```

```ts
// app.service.ts（例）
@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getTodos() {
    return this.prisma.todo.findMany() // ← prisma が undefined だと TypeError
  }
}
```

---

## 解決手順（詳細）

### 1) 依存追加

```bash
pnpm add -D unplugin-swc reflect-metadata
```

### 2) Vitest 設定

- `esbuild: false` を明示し、SWC のみを使う。
- `jsc.transform.legacyDecorator` と `jsc.transform.decoratorMetadata` を **両方** `true` にする。
- `module.type` は `es6` を指定しておくと安定しやすい。
- `setupFiles` で `reflect-metadata` を先に読む。

（完全版は TL;DR 内のサンプルを参照）

### 3) tsconfig の確認

- `experimentalDecorators: true` と `emitDecoratorMetadata: true` を有効にする。
- プロダクションの Nest ビルドは `tsc`／`swc` いずれでもよいが、**テスト時のメタデータは SWC 側の設定が決定打**になる点を理解しておく。

### 4) `reflect-metadata` の読み込み

- setup ファイルで一括読み込みするのが安全である。
- 各 `*.spec.ts` の先頭で `import 'reflect-metadata'` と書く方法でもよいが、漏れが発生しやすい。

---

## モック戦略（Nest 標準の `TestingModule`）

Nest 流のモックは従来どおりでよい。`useValue`（または `useFactory` / `useClass`）で差し替える。

```ts
// app.controller.spec.ts
import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { vi } from 'vitest'

describe('AppController', () => {
  it('service.getData() を呼び出す', async () => {
    const mockAppService = { getData: vi.fn().mockReturnValue('ok') }

    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: mockAppService }],
    }).compile()

    const controller = moduleRef.get(AppController)
    expect(controller.getData()).toBe('ok')
    expect(mockAppService.getData).toHaveBeenCalled()
  })
})
```

```ts
// app.service.spec.ts
import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { AppService } from './app.service'
import { PrismaService } from '../prisma/prisma.service'
import { vi } from 'vitest'

describe('AppService', () => {
  it('prisma.todo.findMany() から取得する', async () => {
    const mockPrisma = {
      todo: { findMany: vi.fn().mockResolvedValue([{ id: 1, title: 't' }]) },
    }

    const moduleRef = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    const service = moduleRef.get(AppService)
    const todos = await service.getTodos()
    expect(todos).toHaveLength(1)
    expect(mockPrisma.todo.findMany).toHaveBeenCalled()
  })
})
```

---

## 動作確認（メタデータの検証）

以下のように `design:paramtypes` を確認すると、コンストラクタ引数の型情報が正しく出ているかを可視化できる。

```ts
import 'reflect-metadata'

console.log(Reflect.getMetadata('design:paramtypes', AppService))
// 期待: [ [Function: PrismaService] ] のような配列
```

---

## よくある落とし穴チェックリスト

-

---

## 付録：最小再現の断片

```ts
// src/app.service.ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}
  async getTodos() {
    return this.prisma.todo.findMany()
  }
}
```

```ts
// src/app.controller.ts
import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getData() {
    return this.appService.getData()
  }
}
```

```ts
// src/app.controller.spec.ts
import 'reflect-metadata'
import { Test } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { vi } from 'vitest'

describe('AppController', () => {
  it('ok', async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: { getData: vi.fn(() => 'ok') } }],
    }).compile()

    const controller = moduleRef.get(AppController)
    expect(controller.getData()).toBe('ok')
  })
})
```

---

## 用語集（Glossary）

- **DI（Dependency Injection）**: 依存オブジェクトを外部から注入する設計手法。NestJS はコンストラクタ注入を標準とする。
- **デコレータ（Decorator）**: クラスやメソッドに付与するメタ情報。`@Injectable()` や `@Controller()` など。
- **メタデータ（design****:paramtypes****）**: TypeScript の設計時型情報。`reflect-metadata` により実行時に参照可能となる。
- ``: デコレータ関連のメタデータをリフレクション経由で扱うためのポリフィル実装。
- **SWC**: 高速な TS/JS コンパイラ。デコレータとメタデータ出力をサポートする。
- **esbuild**: 高速バンドラ/トランスパイラ。標準では設計時型メタデータの出力を行わない。
- **Vitest**: Vite ネイティブなテストランナー。
- **Vite**: 高速ビルドツール。Vitest の基盤でもある。
- **NestJS**: Node.js サーバサイドアプリケーションフレームワーク。
- ``: Nest のテスト用 DI コンテナ。`Test.createTestingModule()` で構築する。
- ``** / **``** / **``: Nest のプロバイダ差し替え手段。モック注入でよく使う。
- ``: Prisma クライアントをラップするサービスの一例。本稿では依存注入の代表例として登場する。
- ``: Vitest が各テストより先に読み込む初期化スクリプト群の設定。
- ``: Vitest のテストケース分離挙動を制御するオプション。必要なら `false` にして反射情報の共有を許可する。

