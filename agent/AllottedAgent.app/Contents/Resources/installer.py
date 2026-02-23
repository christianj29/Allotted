import json
import os
import shutil
import subprocess
import sys
import uuid


def _run_osascript(script: str) -> str:
    # Execute an AppleScript snippet and return the dialog response text.
    result = subprocess.run(["/usr/bin/osascript", "-e", script], capture_output=True, text=True)
    return result.stdout.strip()


def _install(server_url: str):
    # Create the install directory and copy the agent runtime there.
    home = os.path.expanduser("~")
    install_dir = os.path.join(home, "Library", "Application Support", "AllottedAgent")
    os.makedirs(install_dir, exist_ok=True)

    src_dir = os.path.dirname(os.path.abspath(__file__))
    src_agent = os.path.join(src_dir, "agent.py")
    dest_agent = os.path.join(install_dir, "agent.py")
    shutil.copy(src_agent, dest_agent)

    # Persist a unique agent ID and normalized server URL for the runtime.
    config = {
        "agent_id": uuid.uuid4().hex,
        "server_url": server_url.strip().rstrip("/"),
    }
    config_path = os.path.join(install_dir, "config.json")
    with open(config_path, "w", encoding="utf-8") as handle:
        json.dump(config, handle, indent=2)

    # Create a LaunchAgent plist to run the agent at login.
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

    # Load and start the LaunchAgent for the current GUI session.
    uid = os.getuid()
    try:
        subprocess.run(["/bin/launchctl", "bootout", f"gui/{uid}", plist_path], check=False)
        subprocess.run(["/bin/launchctl", "bootstrap", f"gui/{uid}", plist_path], check=True)
        subprocess.run(["/bin/launchctl", "enable", f"gui/{uid}/com.allotted.agent"], check=False)
        subprocess.run(["/bin/launchctl", "kickstart", "-k", f"gui/{uid}/com.allotted.agent"], check=False)
    except Exception as exc:
        _run_osascript(f'display dialog "Launch failed: {exc}" buttons {{"OK"}} default button 1 with title "Allotted Agent"')

    # Confirm installation to the user.
    _run_osascript('display dialog "Installed. The agent will start automatically." buttons {"OK"} default button 1 with title "Allotted Agent"')


def main():
    # Prompt for server URL, then install and start the LaunchAgent.
    server_url = _run_osascript(
        'text returned of (display dialog "Server URL (API base):" default answer "http://localhost:5000/api" with title "Install Allotted Agent")'
    )
    if not server_url:
        _run_osascript('display dialog "Please enter the Server URL." buttons {"OK"} default button 1 with title "Allotted Agent"')
        return 1
    try:
        _install(server_url)
    except Exception as exc:
        _run_osascript(f'display dialog "Install failed: {exc}" buttons {{"OK"}} default button 1 with title "Allotted Agent"')
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
