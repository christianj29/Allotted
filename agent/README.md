# Allotted Agent (Demo)

This is a lightweight macOS agent for demo purposes. It polls the backend for commands and shows a local "updating" window when a patch command arrives.

## Install

1. Open `agent/AllottedAgent.app` and click **Install Agent**.
2. Enter the **Agent ID** (use the computer serial number shown in the app).
3. Confirm the **Server URL** (`http://localhost:5000/api` for local dev).

This installs:
- `~/Library/Application Support/AllottedAgent/agent.py`
- `~/Library/Application Support/AllottedAgent/config.json`
- `~/Library/LaunchAgents/com.allotted.agent.plist`

The agent will start automatically and poll every 5 seconds.

## Uninstall

```
launchctl unload -w ~/Library/LaunchAgents/com.allotted.agent.plist
rm -rf ~/Library/Application\ Support/AllottedAgent
rm ~/Library/LaunchAgents/com.allotted.agent.plist
```

## Notes

- This is for demo use only (in-memory command queue).
- If the backend restarts, queued commands are lost.
