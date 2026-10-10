# Directive: Scaffold Backend and Worker Agents

## Goal
Initialize the off-chain architecture for the Bounty Board. This includes a Fastify Node.js API, a Ponder event indexer, and the foundation for TypeScript worker agents.

## Inputs
- Project root directory.

## Tools/Scripts to Use
- `execution/scaffold_backend.py`

## Outputs
- `services/backend/`: Node.js API with Fastify and Ponder indexer structure.
- `services/worker-agents/`: TypeScript scaffolding for the worker agent runners.
- Both initialized with `package.json` and basic directory layouts.

## Instructions for Orchestrator (Agent)
1. Run `python execution/scaffold_backend.py`.
2. Check the output for any errors.
3. Once the scaffold is complete, use file editing tools to populate the Fastify server, Ponder schema/indexer, and the LLM worker client based on the PRD.
