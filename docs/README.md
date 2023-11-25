# Hollama

An implementation of `llama.cpp` using `node-llama-cpp`.

### Instructions

```shell
# Install dependencies
npm i

# macOS (Intel)
# https://withcatai.github.io/node-llama-cpp/guide/Metal#building-node-llama-cpp-with-metal-support-disabled
npx --no node-llama-cpp download --no-metal

# Windows (CUDA)
npx --no node-llama-cpp download --cuda

# Download models
npx ipull https://huggingface.co/TheBloke/Llama-2-7B-GGUF/resolve/main/llama-2-7b.Q4_K_M.gguf
npx ipull https://huggingface.co/TheBloke/Llama-2-13B-GGUF/resolve/main/llama-2-13b.Q4_K_M.gguf
npx ipull https://huggingface.co/TheBloke/Thespis-Mistral-7B-v0.5-GGUF/resolve/main/thespis-mistral-7b-v0.5.Q4_K_M.gguf
npx ipull https://huggingface.co/TheBloke/MistralLite-7B-GGUF/resolve/main/mistrallite.Q4_K_M.gguf

# Validate model
npx --no node-llama-cpp chat --model ./ai/models/llama-2-7b.Q4_K_M.gguf
npx --no node-llama-cpp chat --model ./ai/models/llama-2-13b.Q4_K_M.gguf
npx --no node-llama-cpp chat --model ./ai/models/thespis-mistral-7b-v0.5.Q4_K_M.gguf
npx --no node-llama-cpp chat --model ./ai/models/mistrallite.Q4_K_M.gguf

# Prompt
Building a website can be done in 10 simple steps:
```
