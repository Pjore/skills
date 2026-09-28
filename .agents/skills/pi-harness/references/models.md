# Pi Harness — LLM Provider Gotchas

## Azure OpenAI with Kimi

Kimi models hosted on Azure OpenAI require a **custom `~/.pi/agent/models.json`** configuration file to work correctly with Agent Pi.

### Configuration

Create or update `~/.pi/agent/models.json` with:

```json
{
  "providers": {
    "azure-openai": {
      "baseUrl": "$AZURE_OPENAI_BASE_URL",
      "api": "openai-completions",
      "apiKey": "$AZURE_OPENAI_API_KEY",
      "models": [
        {
          "id": "Kimi-K2.6",
          "name": "Kimi-K2.6-Azure",
          "input": ["text", "image"],
          "contextWindow": 128000,
          "maxTokens": 16000
        }
      ]
    }
  }
}
```

### Environment Variables

Ensure the following environment variables are set in your Coder workspace:

- `AZURE_OPENAI_API_KEY` — API key for Azure OpenAI
- `AZURE_OPENAI_BASE_URL` — Base URL of your Azure OpenAI resource, e.g. `https://<your-resource>.services.ai.azure.com/openai/v1`

### Common Issues

| Issue | Solution |
|-------|----------|
| Pi fails to start | Check `~/.pi-session.log`. Verify `$AZURE_OPENAI_API_KEY` is set. |
| "401 Unauthorized" | Ensure API key is valid and not expired. Test with `curl` first. |
| Model not found | Verify model ID (`Kimi-K2.6`) matches availability on your Azure resource. |
| Connection timeout | Check network connectivity. Verify `baseUrl` is correct. |
| Token exhausted | Model context window is 128K; maxTokens output is 16K. Keep requests concise. |

### Verify Setup

```bash
# Check Pi session
~/.pi-session-health.sh --status

# Tail logs for errors
tail -20 ~/.pi-session.log

# Test Azure connectivity (if curl installed)
curl -H "Authorization: Bearer $AZURE_OPENAI_API_KEY" \
  "${AZURE_OPENAI_BASE_URL%/v1}/deployments"
```

### File Permissions

Always ensure `models.json` has restricted permissions (no world-readable):
```bash
chmod 600 ~/.pi/agent/models.json
```
