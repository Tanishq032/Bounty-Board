import os
import subprocess
import sys

def run_cmd(cmd, cwd=None):
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {result.stderr}")
        sys.exit(result.returncode)
    print(result.stdout)
    return result.stdout

def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    contracts_dir = os.path.join(root_dir, "contracts")

    if not os.path.exists(contracts_dir):
        print("Initializing Foundry project...")
        try:
            run_cmd(["forge", "init", "contracts", "--no-commit"], cwd=root_dir)
        except FileNotFoundError:
            print("forge not found. Creating directories manually...")
            os.makedirs(os.path.join(contracts_dir, "src"), exist_ok=True)
            os.makedirs(os.path.join(contracts_dir, "test"), exist_ok=True)
            os.makedirs(os.path.join(contracts_dir, "script"), exist_ok=True)
    else:
        print("Contracts directory already exists. Skipping forge init.")

    print("Installing OpenZeppelin contracts...")
    if not os.path.exists(os.path.join(contracts_dir, ".git")):
        try:
            run_cmd(["git", "init"], cwd=contracts_dir)
        except FileNotFoundError:
            print("git not found. Skipping git init.")
            
    try:
        run_cmd(["forge", "install", "OpenZeppelin/openzeppelin-contracts", "--no-commit"], cwd=contracts_dir)
    except FileNotFoundError:
        print("forge not found. Skipping forge install. (You will need to install foundry and openzeppelin later).")

    print("Creating skeleton files...")
    src_dir = os.path.join(contracts_dir, "src")
    files_to_create = [
        "BountyBoard.sol",
        "AgentRegistry.sol",
        "VerifierRegistry.sol",
        "Reputation.sol",
        "VerdictLib.sol",
        "ScoreLib.sol"
    ]

    for f in files_to_create:
        filepath = os.path.join(src_dir, f)
        if not os.path.exists(filepath):
            with open(filepath, "w") as fh:
                fh.write(f"// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n// TODO: Implement {f}\n")
            print(f"Created {filepath}")

    print("Scaffolding complete.")

if __name__ == "__main__":
    main()
