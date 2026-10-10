import os
import subprocess
import sys

def run_cmd(cmd, cwd=None):
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {result.stderr}")
        sys.exit(result.returncode)
    print(result.stdout)
    return result

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    apps_dir = os.path.join(root_dir, "apps")
    os.makedirs(apps_dir, exist_ok=True)
    
    web_dir = os.path.join(apps_dir, "web")
    
    if not os.path.exists(web_dir):
        print("Initializing Next.js Frontend with Tailwind CSS...")
        cmd = [
            "npx", "-y", "create-next-app@latest", "web",
            "--ts", "--tailwind", "--eslint", "--app", "--src-dir",
            "--import-alias", '"@/*"', "--use-npm", "--yes"
        ]
        run_cmd(cmd, cwd=apps_dir)
    else:
        print("Frontend directory apps/web already exists. Skipping initialization.")

    print("Frontend scaffolding complete.")

if __name__ == "__main__":
    main()
