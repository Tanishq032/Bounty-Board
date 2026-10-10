# Directive: Scaffold Smart Contracts

## Goal
Initialize a Foundry project for the Bounty Board smart contracts, install dependencies, and create the foundational contract structures.

## Inputs
- Project root directory.

## Tools/Scripts to Use
- `execution/scaffold_contracts.py`

## Outputs
- A working Foundry project in the `contracts/` directory.
- OpenZeppelin contracts installed.
- Skeleton Solidity files created in `contracts/src/`:
  - `BountyBoard.sol`
  - `AgentRegistry.sol`
  - `VerifierRegistry.sol`
  - `Reputation.sol`
  - `VerdictLib.sol`
  - `ScoreLib.sol`
- Basic test files in `contracts/test/`.

## Edge Cases
- If `contracts/` already exists, skip `forge init`.
- `forge install` might fail if the git repository is not initialized. Ensure `git init` is run before installation if needed, and use `--no-commit` flag.

## Instructions for Orchestrator (Agent)
1. Run `python execution/scaffold_contracts.py`.
2. Check the output for any errors.
3. Once the scaffold is complete, use standard file editing tools to populate the Solidity contracts with the business logic defined in the PRD.
