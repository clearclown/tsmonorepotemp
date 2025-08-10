### gh_issueTemp.md

```yaml

name: General Issue
description: バグ報告・機能提案・改善要望・コードレビュー提出用
title: "[Issue]: "
labels: ["triage"]
assignees: []          # デフォルト担当者がいれば記入

body:
  # ----------------------------------------------------------------
  # 基本
  # ----------------------------------------------------------------
  - type: dropdown
    id: issue_type
    attributes:
      label: Issue Type
      description: 種別を選択
      options:
        - Bug
        - Feature
        - Improvement
        - Code Review
      default: 0
    validations:
      required: true

  - type: input
    id: overview
    attributes:
      label: Overview
      description: 50 文字以内で要点を記述
      placeholder: ex. ログイン後 500 エラーが発生
    validations:
      required: true

  - type: textarea
    id: context
    attributes:
      label: Background / Context
      description: 背景や目的。なぜこの Issue を立てたか
      placeholder: ex. リリース v1.0.3 以降に発生
    validations:
      required: false

  # ----------------------------------------------------------------
  # バグ専用 (Bug を選択した場合は可能な限り埋める)
  # ----------------------------------------------------------------
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior (Bug)
      description: 本来期待する動作
      placeholder: ex. ダッシュボードへ遷移する
    validations:
      required: false

  - type: textarea
    id: actual
    attributes:
      label: Actual Behavior (Bug)
      description: 実際に起きたこと
      placeholder: ex. 500 Internal Server Error
    validations:
      required: false

  - type: textarea
    id: steps
    attributes:
      label: Steps to Reproduce (Bug)
      description: 再現手順 (1 行 1 ステップ)
      placeholder: |
        1. アプリを起動
        2. ユーザーAでログイン
        3. 「設定」をクリック
      value: |
        1.
    validations:
      required: false

  - type: dropdown
    id: version
    attributes:
      label: Version (Bug)
      description: 使用中のバージョン
      options:
        - 1.0.2 (Stable)
        - 1.0.3 (Edge)
        - other
      default: 0
    validations:
      required: false

  - type: dropdown
    id: browsers
    attributes:
      label: Browser(s) (Bug)
      description: 該当ブラウザ
      multiple: true
      options:
        - Firefox
        - Chrome
        - Safari
        - Microsoft Edge

  - type: textarea
    id: logs
    attributes:
      label: Logs (Bug)
      description: 関連ログ（```不要）。長い場合は Gist でも可
      render: shell

  # ----------------------------------------------------------------
  # コードレビュー用 (Code Review を選択した場合に利用)
  # ----------------------------------------------------------------
  - type: markdown
    attributes:
      value: |
        ### 🔍 Code Review 観点
        **拡張性 / 可読性 / 継続性 / 脆弱性潰し** の 4 項目を中心に、具体的・建設的に指摘すること。
        参考: `CODING_RULES.md` :contentReference[oaicite:0]{index=0}

  - type: textarea
    id: code_review_comments
    attributes:
      label: Code Review Comments
      description: 観点ごとに気づきを記入
      placeholder: |
        #### 拡張性
        - **依存注入**を用いて実装を疎結合にするとテスト容易
        #### 可読性
        - 関数 `handleData()` 内が 80 行超え、責務分割を推奨
        #### 継続性
        - CI に E2E テストを追加すると回帰を検知しやすい
        #### 脆弱性潰し
        - 外部入力を SQL へ直接連結しており SQLi のリスク
      render: markdown
    validations:
      required: false

  # ----------------------------------------------------------------
  # 共通オプション
  # ----------------------------------------------------------------
  - type: textarea
    id: proposed_fix
    attributes:
      label: Proposed Solution / Idea
      description: もし解決策や実装アイデアがあれば記載
      placeholder: ex. 認証トークンの有効期限チェックを追加する

  - type: textarea
    id: tasks
    attributes:
      label: Tasks
      description: この Issue を完了させるための作業をチェックリストで列挙
      placeholder: |
        - [ ] 再現テスト作成
        - [ ] 修正実装
        - [ ] リリースノート更新
      value: |
        - [ ]

  - type: checkboxes
    id: terms
    attributes:
      label: Code of Conduct
      description: Issue を提出することで行動規範へ同意する
      options:
        - label: 同意します
          required: true

```
