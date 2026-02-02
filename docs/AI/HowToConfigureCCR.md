Env Setup

```
npm 
npm install -g @musistudio/claude-code-router
less ~/.claude-code-router/config.json

export ANTHROPIC_AUTH_TOKEN=sxxaa0c6xxxca4e18b9776eadce32dc756f45fbfebd485ae7bc3f3
export ANTHROPIC_BASE_URL=https://anyrouter.top

export ANTHROPIC_AUTH_TOKEN=01d5770286f6422ca3bcba42415c66d6.u7cIZBA4c0Vvup24
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic

ccr restart

ccr code
```

OpenRouter Configuration
```
{
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "NON_INTERACTIVE_MODE": false,
  "Providers": [
    {
      "name": "openrouter",
      "api_base_url": "https://openrouter.ai/api/v1/chat/completions",
      "api_key": "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",
      "models": [
        "google/gemini-2.5-pro",
        "anthropic/claude-sonnet-4",
        "anthropic/claude-opus-4.1",
        "anthropic/claude-3.5-sonnet",
        "anthropic/claude-3.7-sonnet:thinking"
      ],
      "transformer": {
        "use": ["openrouter"]
      }
    }
  ],
  "Router": {
    "default": "openrouter,anthropic/claude-sonnet-4",
    "background": "openrouter,anthropic/claude-opus-4.1",
    "think": "openrouter,google/gemini-2.5-pro",
    "longContext": "openrouter,google/gemini-2.5-pro:online",
    "longContextThreshold": 60000,
  }
}

Don't forget two export commands before running CCR


```

ModelScope configuration
```
{
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "NON_INTERACTIVE_MODE": false,
  "Providers": [
    {
      "name": "modelscope",
      "api_base_url": "https://api-reference.modelscope.cn/api/v1/chat/completions",
      "api_key": "ms-f3fae7e1-ffb9-4d72-933f-3e25195eb814",
      "models": [
        "Qwen/Qwen3-Coder-480B-A35B-Instruct",
        "Qwen/Qwen3-235B-A22B-Instruct-2507"
      ],
      "transformer": {
        "use": [
          [
          "maxtoken",
          {
            "max_tokens": 65536
          }
          ],
        "enhancetool"
        ],
        "Qwen/Qwen3-235B-A22B-Instruct-2507": {
          "use": ["reasoning"]
        }
      }
    }
  ],
  "Router": {
    "default": "modelscope,Qwen/Qwen3-Coder-480B-A35B-Instruct"
  }
}

坑: ModelScope必须绑定阿里云账号 (只有中文可用)
```

https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys 
智谱
```
{
  "LOG": true,
  "API_TIMEOUT_MS": 600000,
  "NON_INTERACTIVE_MODE": false,
  "Providers": [
    {
      "name": "zhipu",
      "api_base_url": "https://open.bigmodel.cn/api/coding/paas/v4/chat/completions",
      "api_key": "d00xxxPvNLj5",
      "models": [
        "glm-4.7",
        "glm-4.6",
        "glm-4.5",
        "glm-4.5-air"
      ],
      "transformer": {
        "use": ["openai"]
      }
    }
  ],
  "Router": {
    "default": "zhipu,glm-4.7",
    "background": "zhipu,glm-4.7",
    "think": "zhipu,glm-4.7",
    "longContext": "zhipu,glm-4.7",
    "longContextThreshold": 60000
  }
}
```