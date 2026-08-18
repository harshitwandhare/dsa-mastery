"""The 22-minute struggle timer from the daily protocol.

Run:
    python -m dsa.timer                 # 22-minute problem timer
    python -m dsa.timer 10              # 10-minute review block
    python -m dsa.timer 45 "mock"       # 45-minute mock interview
"""

from __future__ import annotations

import sys
import time


def countdown(minutes: float, label: str = "problem") -> None:
    total = int(minutes * 60)
    print(f"\n{label.upper()} -- {minutes:g} minutes")
    print("Ctrl-C to stop early.\n")
    try:
        for remaining in range(total, -1, -1):
            mins, secs = divmod(remaining, 60)
            bar_width = 40
            filled = int(bar_width * (total - remaining) / total) if total else bar_width
            bar = "#" * filled + "." * (bar_width - filled)
            print(f"\r  [{bar}] {mins:02d}:{secs:02d}  ", end="", flush=True)
            if remaining:
                time.sleep(1)
        print("\n\n  TIME. Stop coding.")
        if label == "problem":
            print("  -> Open the editorial / NeetCode video.")
            print("  -> Then close it and re-implement from scratch.")
            print("  -> Then log the PATTERN in tracker.md.\n")
    except KeyboardInterrupt:
        elapsed = total - remaining
        print(f"\n\n  Stopped at {elapsed // 60:02d}:{elapsed % 60:02d}.\n")


def main() -> None:
    minutes = float(sys.argv[1]) if len(sys.argv) > 1 else 22
    label = sys.argv[2] if len(sys.argv) > 2 else "problem"
    countdown(minutes, label)


if __name__ == "__main__":
    main()
