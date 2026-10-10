import os
import subprocess
import sys
import json

def run_cmd(cmd, cwd=None):
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {result.stderr}")
    else:
        print(result.stdout)
    return result

def create_package_json(path, name, deps, dev_deps, scripts):
    pkg = {
        "name": name,
        "version": "1.0.0",
        "private": True,
        "scripts": scripts,
        "dependencies": deps,
        "devDependencies": dev_deps
    }
    with open(os.path.join(path, "package.json"), "w") as f:
        json.dump(pkg, f, indent=2)
    print(f"Created package.json for {name}")

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    services_dir = os.path.join(root_dir, "services")
    os.makedirs(services_dir, exist_ok=True)

    # Backend API & Indexer (Fastify + Ponder)
    backend_dir = os.path.join(services_dir, "backend")
    os.makedirs(os.path.join(backend_dir, "src"), exist_ok=True)
    create_package_json(
        backend_dir, 
        "bounty-board-backend", 
        {"fastify": "^4.26.2", "@ponder/core": "^0.2.0", "viem": "^2.0.0"}, 
        {"typescript": "^5.0.0", "@types/node": "^20.0.0"},
        {"dev": "fastify start", "build": "tsc"}
    )
    
    # Worker Agents
    worker_dir = os.path.join(services_dir, "worker-agents")
    os.makedirs(os.path.join(worker_dir, "src"), exist_ok=True)
    create_package_json(
        worker_dir, 
        "bounty-board-workers", 
        {"viem": "^2.0.0", "dotenv": "^16.4.0"}, 
        {"typescript": "^5.0.0", "@types/node": "^20.0.0"},
        {"start": "ts-node src/index.ts"}
    )

    # Verifier Service
    verifier_dir = os.path.join(services_dir, "verifier")
    os.makedirs(os.path.join(verifier_dir, "src"), exist_ok=True)
    create_package_json(
        verifier_dir, 
        "bounty-board-verifier", 
        {"viem": "^2.0.0", "dotenv": "^16.4.0"}, 
        {"typescript": "^5.0.0", "@types/node": "^20.0.0"},
        {"start": "ts-node src/index.ts"}
    )

    print("Backend scaffolding complete.")

if __name__ == "__main__":
    main()
