import json
import os
import time
import tkinter as tk
from tkinter import ttk
from urllib import request, error

CONFIG_PATH = os.path.join(
    os.path.expanduser("~"),
    "Library",
    "Application Support",
    "AllottedAgent",
    "config.json",
)


def _load_config():
    if not os.path.exists(CONFIG_PATH):
        raise RuntimeError("Agent config not found. Please run the installer.")
    with open(CONFIG_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _http_get(url):
    req = request.Request(url, method="GET")
    with request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _http_post(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    with request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _show_patch_window(message: str):
    root = tk.Tk()
    root.title("Allotted Agent")
    root.geometry("420x200")
    root.resizable(False, False)

    label = ttk.Label(root, text=message)
    label.pack(pady=(0, 12))

    progress = ttk.Progressbar(root, orient="horizontal", length=320, mode="determinate")
    progress.pack(pady=6)

    root.update_idletasks()

    for step in range(0, 101, 5):
        progress["value"] = step
        root.update_idletasks()
        root.update()
        time.sleep(0.2)

    root.destroy()


def _handle_patch(server_url: str, agent_id: str, command: dict):
    message = command.get("payload", {}).get("message") or "Your Computer is currently updating"
    _show_patch_window(message)
    complete_url = f"{server_url}/agents/{agent_id}/commands/{command['id']}/complete"
    _http_post(complete_url, {"status": "completed", "payload": command.get("payload", {})})


def main():
    config = _load_config()
    server_url = config.get("server_url", "").rstrip("/")
    agent_id = config.get("agent_id", "").strip()
    if not server_url or not agent_id:
        raise RuntimeError("Agent config missing server_url or agent_id.")

    while True:
        try:
            next_url = f"{server_url}/agents/{agent_id}/commands/next"
            response = _http_get(next_url)
            command = response.get("command")
            if command:
                if command.get("type") == "patch":
                    _handle_patch(server_url, agent_id, command)
        except error.URLError:
            pass
        except Exception:
            pass
        time.sleep(5)


if __name__ == "__main__":
    main()
