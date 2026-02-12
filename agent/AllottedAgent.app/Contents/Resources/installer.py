import json
import os
import shutil
import subprocess
import sys
import tkinter as tk
from tkinter import messagebox


def _install(agent_id: str, server_url: str):
    home = os.path.expanduser("~")
    install_dir = os.path.join(home, "Library", "Application Support", "AllottedAgent")
    os.makedirs(install_dir, exist_ok=True)

    src_dir = os.path.dirname(os.path.abspath(__file__))
    src_agent = os.path.join(src_dir, "agent.py")
    dest_agent = os.path.join(install_dir, "agent.py")
    shutil.copy(src_agent, dest_agent)

    config = {
        "agent_id": agent_id.strip(),
        "server_url": server_url.strip().rstrip("/"),
    }
    config_path = os.path.join(install_dir, "config.json")
    with open(config_path, "w", encoding="utf-8") as handle:
        json.dump(config, handle, indent=2)

    plist = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.allotted.agent</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/bin/python3</string>
    <string>{dest_agent}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>
"""
    plist_path = os.path.join(home, "Library", "LaunchAgents", "com.allotted.agent.plist")
    os.makedirs(os.path.dirname(plist_path), exist_ok=True)
    with open(plist_path, "w", encoding="utf-8") as handle:
        handle.write(plist)

    try:
        subprocess.run(["launchctl", "load", "-w", plist_path], check=False)
    except Exception:
        pass

    messagebox.showinfo("Allotted Agent", "Installed. The agent will start automatically.")


def main():
    root = tk.Tk()
    root.title("Install Allotted Agent")
    root.geometry("420x240")
    root.resizable(False, False)

    tk.Label(root, text="Agent ID (use the computer serial number):").pack(pady=(6, 4))
    agent_entry = tk.Entry(root, width=46)
    agent_entry.pack()

    tk.Label(root, text="Server URL (API base):").pack(pady=(12, 4))
    url_entry = tk.Entry(root, width=46)
    url_entry.insert(0, "http://localhost:5000/api")
    url_entry.pack()

    def on_install():
        agent_id = agent_entry.get().strip()
        server_url = url_entry.get().strip()
        if not agent_id or not server_url:
            messagebox.showerror("Allotted Agent", "Please enter both Agent ID and Server URL.")
            return
        try:
            _install(agent_id, server_url)
            root.destroy()
        except Exception as exc:
            messagebox.showerror("Allotted Agent", f"Install failed: {exc}")

    tk.Button(root, text="Install Agent", command=on_install).pack(pady=18)
    tk.Label(root, text="You can change these later in config.json.").pack()

    root.mainloop()


if __name__ == "__main__":
    sys.exit(main())
