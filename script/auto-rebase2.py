import subprocess, re, os, sys, time

def resolve_conflicts():
    """Resolve all conflicts: merge imports, take theirs for content."""
    result = subprocess.run(["git", "diff", "--name-only", "--diff-filter=U"],
                          capture_output=True, text=True)
    files = [f for f in result.stdout.strip().split("\n") if f.strip()]
    all_resolved = True

    for f in files:
        if not os.path.exists(f):
            continue
        with open(f, encoding="utf-8", errors="replace") as fh:
            content = fh.read()

        if "<<<<<<<" not in content:
            subprocess.run(["git", "add", f])
            continue

        def resolve(m):
            ours = m.group(1)
            theirs = m.group(2)
            def is_imports(s):
                lines = [l.strip() for l in s.strip().split("\n") if l.strip()]
                return all(l.startswith("import ") or l.startswith("export ") for l in lines) if lines else True
            if is_imports(ours) and is_imports(theirs):
                return ours + "\n" + theirs
            return theirs  # Take i18n changes

        new_content = re.sub(r'<<<<<<< [^\n]*\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]*',
                            resolve, content, flags=re.DOTALL)

        if "<<<<<<<" not in new_content:
            with open(f, "w", encoding="utf-8") as fh:
                fh.write(new_content)
            subprocess.run(["git", "add", f])
        else:
            all_resolved = False

    return all_resolved, files

# Main loop
max_iterations = 200
for i in range(max_iterations):
    # Continue rebase
    result = subprocess.run(["git", "rebase", "--continue"],
                          capture_output=True, text=True,
                          env={**os.environ, "GIT_EDITOR": "true"})

    if result.returncode == 0:
        print(f"\n=== REBASE COMPLETE (iteration {i+1}) ===")
        # Update branch
        sha = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True).stdout.strip()
        subprocess.run(["git", "branch", "-f", "i18n/consolidate", sha])
        subprocess.run(["git", "checkout", "i18n/consolidate"])
        break

    stderr = result.stderr
    stdout = result.stdout

    if "CONFLICT" in stderr or "conflict" in stderr.lower():
        resolved, files = resolve_conflicts()
        if resolved:
            print(f"[{i+1}] resolved {len(files)} conflicts")
        else:
            print(f"[{i+1}] MANUAL conflict in: {files}")
            sys.exit(1)
    elif "Applied" in stdout or "rebasing" in stdout.lower():
        continue
    elif "no rebase" in stderr.lower():
        print("No rebase in progress - done?")
        break
    else:
        # Might need editor for commit message
        if "could not apply" in stderr.lower():
            resolved, files = resolve_conflicts()
            if resolved:
                continue
            else:
                print(f"[{i+1}] MANUAL: {files}")
                sys.exit(1)
        print(f"[{i+1}] unexpected: {stderr[:150]}")
        # Try adding all and continuing
        subprocess.run(["git", "add", "-A"])
        continue

print(f"\nFinal HEAD: {subprocess.run(['git', 'log', '--oneline', '-1'], capture_output=True, text=True).stdout.strip()}")
