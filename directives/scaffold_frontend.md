# Directive: Scaffold Frontend (Next.js & Tailwind)

## Goal
Initialize the Next.js frontend application with Tailwind CSS for the Bounty Board.

## Inputs
- Project root directory.

## Tools/Scripts to Use
- `execution/scaffold_frontend.py`

## Outputs
- `apps/web/`: Next.js 14+ application with App Router, TypeScript, and Tailwind CSS installed and configured.

## Instructions for Orchestrator (Agent)
1. Run `python execution/scaffold_frontend.py`.
2. Check the output for any errors.
3. Once the scaffold is complete, begin constructing the React components for the UI dashboard (Demo Mode, Poster View, Worker View).
