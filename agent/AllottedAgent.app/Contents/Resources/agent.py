import json
import os
import subprocess
import time
from urllib import request, error

CONFIG_PATH = os.path.join(
    os.path.expanduser("~"),
    "Library",
    "Application Support",
    "AllottedAgent",
    "config.json",
)


def _load_config():
    # Read local agent configuration written by the installer.
    if not os.path.exists(CONFIG_PATH):
        raise RuntimeError("Agent config not found. Please run the installer.")
    with open(CONFIG_PATH, "r", encoding="utf-8") as handle:
        return json.load(handle)


def _http_get(url):
    # Basic JSON GET helper for the agent API.
    req = request.Request(url, method="GET")
    with request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _http_post(url, payload):
    # Basic JSON POST helper for the agent API.
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=data, method="POST")
    req.add_header("Content-Type", "application/json")
    with request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _run_cmd(cmd: list[str]) -> str:
    # Run a shell command and return stdout (or empty string on failure).
    try:
        result = subprocess.run(cmd, check=False, capture_output=True, text=True)
        return result.stdout.strip()
    except Exception:
        return ""


def _get_system_info():
    # Gather hardware and OS details for device registration.
    hw_info = _run_cmd(["/usr/sbin/system_profiler", "SPHardwareDataType"])
    serial_number = ""
    model_name = ""
    model_identifier = ""
    processor_type = ""

    for line in hw_info.splitlines():
        if "Serial Number" in line:
            serial_number = line.split(":")[-1].strip()
        elif "Model Name" in line:
            model_name = line.split(":")[-1].strip()
        elif "Model Identifier" in line:
            model_identifier = line.split(":")[-1].strip()
        elif "Chip" in line or "Processor Name" in line:
            processor_type = line.split(":")[-1].strip()

    name = _run_cmd(["/usr/sbin/scutil", "--get", "ComputerName"])
    os_version = _run_cmd(["/usr/bin/sw_vers", "-productVersion"])
    cache_size = _run_cmd(["/usr/sbin/sysctl", "-n", "hw.l3cachesize"])
    if cache_size.isdigit():
        cache_size = f"{int(cache_size) // (1024 * 1024)} MB"
    else:
        cache_size = ""

    return {
        "name": name or "Mac",
        "model": model_name or "Mac",
        "serialNumber": serial_number,
        "osVersion": os_version or "",
        "modelIdentifier": model_identifier or "",
        "processorType": processor_type or "",
        "cacheSize": cache_size or "",
    }


def _register_agent(server_url: str, agent_id: str):
    # Register the device with the server if we have a serial number.
    info = _get_system_info()
    if not info.get("serialNumber"):
        return
    payload = {
        "agentId": agent_id,
        "name": info["name"],
        "model": info["model"],
        "serialNumber": info["serialNumber"],
        "osVersion": info.get("osVersion") or "",
        "modelIdentifier": info.get("modelIdentifier") or "",
        "processorType": info.get("processorType") or "",
        "cacheSize": info.get("cacheSize") or "",
    }
    try:
        _http_post(f"{server_url}/agents/register", payload)
    except Exception:
        pass


def _show_patch_window(message: str):
    # Use macOS dialogs to avoid Tk dependencies that may crash on older macOS.
    subprocess.run(
        [
            "/usr/bin/osascript",
            "-e",
            f'display dialog "{message}" buttons {{"OK"}} default button 1 with title "Allotted Agent"',
        ],
        check=False,
    )
    # Simulate progress with periodic notifications.
    for pct in range(0, 101, 20):
        subprocess.run(
            [
                "/usr/bin/osascript",
                "-e",
                f'display notification "Updating... {pct}%" with title "Allotted Agent"',
            ],
            check=False,
        )
        time.sleep(0.4)


def _handle_patch(server_url: str, agent_id: str, command: dict):
    # Show the patch UI and acknowledge completion to the server.
    message = command.get("payload", {}).get("message") or "Your Computer is currently updating"
    _show_patch_window(message)
    complete_url = f"{server_url}/agents/{agent_id}/commands/{command['id']}/complete"
    _http_post(complete_url, {"status": "completed", "payload": command.get("payload", {})})


def main():
    # Main polling loop: fetch commands and execute supported types.
    config = _load_config()
    server_url = config.get("server_url", "").rstrip("/")
    agent_id = config.get("agent_id", "").strip()
    if not server_url or not agent_id:
        raise RuntimeError("Agent config missing server_url or agent_id.")

    _register_agent(server_url, agent_id)

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
