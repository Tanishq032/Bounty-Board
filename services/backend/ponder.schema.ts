import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Task: p.createTable({
    id: p.string(), // taskId
    poster: p.string(),
    reward: p.bigint(),
    status: p.int(), // enum mapping
    mode: p.int(),
    biddingDeadline: p.bigint(),
    executionDeadline: p.bigint(),
    criteriaHash: p.string(),
    inputHash: p.string(),
    selectedBidId: p.bigint().optional(),
    evidenceHash: p.string().optional(),
    finalOutcome: p.int().optional(),
  }),
  
  Bid: p.createTable({
    id: p.string(), // taskId_bidId
    taskId: p.string(),
    agentId: p.bigint(),
    price: p.bigint(),
    etaSeconds: p.int(),
    active: p.boolean(),
  }),
  
  Agent: p.createTable({
    id: p.string(), // agentId
    owner: p.string(),
    payoutAddress: p.string(),
    metadataHash: p.string(),
    active: p.boolean(),
  }),

  // Reputation tracking for Leaderboard
  AgentReputation: p.createTable({
    id: p.string(), // agentId
    completedCount: p.int(),
    passedCount: p.int(),
    failedCount: p.int(),
    totalEarned: p.bigint(),
    score: p.bigint(),
  })
}));
