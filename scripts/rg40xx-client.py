import sys
import time
import json
import urllib.request
import urllib.parse
import struct
import os

# Configuration
# Replace with your Mac's local IP address
API_BASE_URL = "http://192.168.1.5:3000/api/psp/approve"

# Input device path (RG40XX V usually has inputs on event0 or event1)
# You need to check 'evtest' to find which one is the keypad
INPUT_DEVICE_PATH = "/dev/input/event0"
TTY_PATH = "/dev/tty0"

# Button Codes (Generic Linux input codes, adjust if necessary)
BTN_A = 304 
BTN_B = 305

def log_to_screen(message):
    """Writes message to the physical screen console and stdout"""
    try:
        # Write to stdout (for SSH)
        print(message)
        # Write to device screen (requires root)
        with open(TTY_PATH, 'w') as tty:
            tty.write(message + "\n")
    except Exception:
        pass

def check_status():
    try:
        with urllib.request.urlopen(API_BASE_URL, timeout=2) as response:
            if response.status == 200:
                return json.loads(response.read().decode())
    except Exception as e:
        log_to_screen(f"Conn Error: {e}")
    return {"status": "ERROR", "message": "Connection Failed"}

def send_approval(action="Approve"):
    try:
        log_to_screen(f"Sending {action}...")
        data = json.dumps({"action": action}).encode('utf-8')
        req = urllib.request.Request(API_BASE_URL, data=data, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=2) as response:
            log_to_screen("Sent!")
    except Exception as e:
        log_to_screen(f"Failed to send: {e}")

def main():
    log_to_screen("RG40XX APPROVED TERMINAL STARTED")
    log_to_screen(f"Target: {API_BASE_URL}")
    
    if not os.path.exists(INPUT_DEVICE_PATH):
        log_to_screen(f"Error: {INPUT_DEVICE_PATH} missing.")
        return

    input_dev = open(INPUT_DEVICE_PATH, "rb")
    last_status = ""
    
    while True:
        state = check_status()
        current_status = state.get("status", "UNKNOWN")
        message = state.get("message", "")

        if current_status != last_status:
            log_to_screen(f"\n[{current_status}]")
            if message:
                log_to_screen(f"MSG: {message}")
            if current_status == "WAITING":
                log_to_screen(">>> PRESS A: APPROVE <<<")
                log_to_screen(">>> PRESS B: REJECT  <<<")
            last_status = current_status

        # Non-blocking input handling approach using standard library
        import select
        r, w, x = select.select([input_dev], [], [], 1.0) # 1s refresh rate
        
        if r:
            event = input_dev.read(24)
            if event:
                # Unpack struct input_event (llHHI on 64bit, often different on 32bit)
                # RG40XX might be 64bit (aarch64) or 32bit.
                # Standard 'llHHI' is usually safe for 64-bit Linux.
                try:
                    (tv_sec, tv_usec, type, code, value) = struct.unpack('llHHI', event)
                    # type 1 = EV_KEY, value 1 = KeyDown
                    if type == 1 and value == 1:
                        if code == BTN_A and current_status == "WAITING":
                            send_approval("Approve")
                        elif code == BTN_B and current_status == "WAITING":
                            send_approval("Reject")
                except struct.error:
                    pass # Input format might vary

        # No sleep needed due to select timeout

