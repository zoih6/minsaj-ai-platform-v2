#!/usr/bin/env python3
"""
devd.py — Detached dev-server daemonizer for Minsaj (container-safe).

Problem: bash tool sessions are ephemeral; anything in their process tree
gets reaped when the call ends. Even setsid+nohup children die.

Fix: classic double-fork daemonization:
  fork1 -> parent exits -> child calls setsid() (new session, no ctty)
  fork2 -> parent exits -> grandchild is a true orphan, reparented to
          PID 1 (tini), with zero linkage to the spawning bash.

Then exec npm run dev with all fds redirected to dev.log.

Usage:
  python3 devd.py start    # daemonize + exec dev server
  python3 devd.py stop     # kill running dev server (by pidfile)
  python3 devd.py status   # report pid + port state
"""
import os
import sys
import signal
import time
import subprocess

BASE = "/home/z/my-project"
LOG = f"{BASE}/dev.log"          # match platform convention from fullstack-dev skill
PIDFILE = f"{BASE}/devd.pid"
PORT = 3000


def _write_pidfile():
    with open(PIDFILE, "w") as f:
        f.write(str(os.getpid()))


def _redirect_fds():
    sys.stdout.flush()
    sys.stderr.flush()
    # stdin <- /dev/null ; stdout/stderr -> dev.log (line buffered, unbuffered err)
    with open("/dev/null", "rb") as dn, open(LOG, "ab", 0) as lg:
        os.dup2(dn.fileno(), 0)
        os.dup2(lg.fileno(), 1)
        os.dup2(lg.fileno(), 2)


def start():
    # ---- fork 1 ----
    pid = os.fork()
    if pid > 0:
        # parent: wait briefly so grandchild is up, then report
        time.sleep(1.5)
        try:
            with open(PIDFILE) as f:
                dp = int(f.read().strip())
            os.kill(dp, 0)
            print(f"DAEMON_OK pid={dp}")
        except Exception as e:
            print(f"DAEMON_UNVERIFIED: {e}")
        return

    # child 1: new session, detach ctty
    os.setsid()

    # ---- fork 2 ----
    pid = os.fork()
    if pid > 0:
        os._exit(0)  # child1 exits, grandchild orphaned -> reparented to tini

    # grandchild: the daemon
    _redirect_fds()
    _write_pidfile()
    os.chdir(BASE)

    # reset signal dispositions
    signal.signal(signal.SIGHUP, signal.SIG_IGN)
    signal.signal(signal.SIGTERM, signal.SIG_DFL)

    # exec the dev server (replaces python image entirely)
    os.environ["NEXT_TELEMETRY_DISABLED"] = "1"
    os.execvp("npm", ["npm", "run", "dev"])


def stop():
    try:
        with open(PIDFILE) as f:
            pid = int(f.read().strip())
    except FileNotFoundError:
        print("NOT_RUNNING")
        return
    # kill whole process group of the daemon (it is a session leader)
    try:
        os.killpg(pid, signal.SIGTERM)
        time.sleep(2)
        try:
            os.killpg(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        print(f"STOPPED pid={pid}")
    except ProcessLookupError:
        print("NOT_RUNNING (stale pidfile)")
    finally:
        try:
            os.unlink(PIDFILE)
        except FileNotFoundError:
            pass


def status():
    # pidfile check
    pid = None
    try:
        with open(PIDFILE) as f:
            pid = int(f.read().strip())
        os.kill(pid, 0)
        alive = "ALIVE"
    except FileNotFoundError:
        alive = "NO_PIDFILE"
    except ProcessLookupError:
        alive = "DEAD"
    except PermissionError:
        alive = "ALIVE(other-user)"
    # port check
    r = subprocess.run(
        ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
         "--max-time", "5", f"http://localhost:{PORT}/ar"],
        capture_output=True, text=True,
    )
    print(f"daemon={alive} pid={pid} port={r.stdout.strip() or 'ERR'}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "status"
    {"start": start, "stop": stop, "status": status}.get(cmd, status)()
