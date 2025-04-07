
## Hands-on github workflow implementations:


### Setup pull request workflow:

Re-requisites:
1. Must install the SUGAR GitHub App in their organization
    - https://github.com/marketplace/sugar-github-app | https://github.tools.sap/organizations/sn1-sit-org/settings/installations/15524
2. Enable workflow from SAP Hyperspace
    - https://portal.hyperspace.tools.sap/home



Acronym:
- Sugar (Solinas Universal Github Action Runners) is a part of [solinas portfolio](https://wiki.one.int.sap/wiki/display/DevFw/Solinas)


```jsx
name: PR-check
on:
  pull_request:
    types: [opened, reopened, synchronize, edited]
    branches:
    - vlab
    - prod

env:
  VALIDWAY: 'tools-vlab vlab-prod'

jobs:
  pull-request-check:
    runs-on: solinas
    steps:

      - name: Checkout
        uses: actions/checkout@v4

      - name: Pull request count check
        env:
          GH_TOKEN: ${{ github.token }}
        run: .github/workflows/scripts/pull-request-count-check.sh
        shell: bash

      - name: Branch order check
        run: .github/workflows/scripts/branch-order-check.sh
        shell: bash
```

Reference:
1. PR trigger workflow [events-that-trigger-workflows#pull_request](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#pull_request)
2. Workflow built-in var [Using the GITHUB_TOKEN in a workflow](https://docs.github.com/en/actions/security-for-github-actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow)
3. Offical Sugar Doc https://wiki.one.int.sap/wiki/display/DevFw/SUGAR
4. [sugar-service-solinas-hosted-runners](https://pages.github.tools.sap/github/features-and-how-tos/features/actions/how-tos/runners/#sugar-service-solinas-hosted-runners)