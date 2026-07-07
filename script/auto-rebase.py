import subprocess, re, os, sys

def auto_resolve_imports():
    """Auto-resolve import-only conflicts by keeping both sides."""
    files = subprocess.run(["git", "diff", "--name-only", "--diff-filter=U"],
                          capture_output=True, text=True).stdout.strip().split()
    resolved = 0
    manual = 0
    for f in files:
        if not f or not os.path.exists(f):
            continue
        with open(f, encoding="utf-8", errors="replace") as fh:
            content = fh.read()
        pattern = re.compile(r'<<<<<<< [^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*', re.DOTALL)
        def repl(m):
            ours, theirs = m.group(1), m.group(2)
            def is_imports(s):
                lines = [l.strip() for l in s.strip().split("\n") if l.strip()]
                return all(l.startswith("import ") or l.startswith("export ") for l in lines) if lines else True
            if is_imports(ours) and is_imports(theirs):
                return ours + "\n" + theirs
            return m.group(0)
        new_content = pattern.sub(repl, content)
        if "<<<<<<<" not in new_content:
            with open(f, "w", encoding="utf-8") as fh:
                fh.write(new_content)
            subprocess.run(["git", "add", f])
            resolved += 1
        else:
            manual += 1
    return resolved, manual, files

def show_manual_conflicts():
    """Print conflict details for manual resolution."""
    files = subprocess.run(["git", "diff", "--name-only", "--diff-filter=U"],
                          capture_output=True, text=True).stdout.strip().split()
    for f in files:
        if not f or not os.path.exists(f):
            continue
        with open(f, encoding="utf-8", errors="replace") as fh:
            for i, line in enumerate(fh, 1):
                if line.startswith("<<<<<<<") or line.startswith("=======") or line.startswith(">>>>>>>"):
                    print(f"  {f}:{i}: {line.rstrip()[:100]}")

iteration = 0
while True:
    iteration += 1
    # Try to continue rebase
    result = subprocess.run(["git", "rebase", "--continue"], capture_output=True, text=True)

    if result.returncode == 0:
        print(f"\n=== REBASE COMPLETE after {iteration} iterations ===")
        break

    # Check if rebase is still in progress
    if "CONFLICT" in result.stderr or "conflict" in result.stderr.lower():
        resolved, manual, files = auto_resolve_imports()
        if manual > 0:
            print(f"\nIteration {iteration}: {resolved} auto-resolved, {manual} MANUAL conflicts:")
            show_manual_conflicts()
            # Try to auto-resolve non-import conflicts by preferring ours (i18n changes)
            for f in files:
                if not f or not os.path.exists(f):
                    continue
                with open(f, encoding="utf-8", errors="replace") as fh:
                    content = fh.read()
                if "<<<<<<<" in content:
                    # For non-import conflicts, prefer ours (HEAD = origin/dev) for functionality,
                    # but keep i18n t() calls from theirs
                    # Strategy: take theirs (our i18n changes) - they add t() on top of existing code
                    new_content = re.sub(r'<<<<<<< [^\n]*\n', '', content)
                    new_content = re.sub(r'\n=======\n.*?\n>>>>>>> [^\n]*', '', new_content, flags=re.DOTALL)
                    if "<<<<<<<" not in new_content:
                        with open(f, "w", encoding="utf-8") as fh:
                            fh.write(new_content)
                        subprocess.run(["git", "add", f])
                        print(f"  Resolved {f} by taking ours (i18n)")
            # Check if all resolved
            remaining = subprocess.run(["git", "diff", "--name-only", "--diff-filter=U"],
                                       capture_output=True, text=True).stdout.strip()
            if remaining:
                print(f"  STILL CONFLICTED: {remaining}")
                sys.exit(1)
        else:
            print(f"Iteration {iteration}: auto-resolved {resolved} import conflicts")
    elif "no rebase in progress" in result.stderr.lower():
        print("No rebase in progress")
        break
    else:
        print(f"Unexpected state: {result.stderr[:200]}")
        break
