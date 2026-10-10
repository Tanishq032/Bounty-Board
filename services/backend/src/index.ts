import { ponder } from "@/generated";

ponder.on("BountyBoard:TaskCreated", async ({ event, context }) => {
  const { Task } = context.db;
  await Task.create({
    id: event.args.taskId.toString(),
    data: {
      poster: event.args.poster,
      reward: event.args.reward,
      status: 0, // Open
      mode: 0, // Not available in event? Wait, event only has taskId, poster, reward.
      biddingDeadline: 0n, // We will need to fetch from contract or update event.
      executionDeadline: 0n,
      criteriaHash: "",
      inputHash: "",
    },
  });
});

ponder.on("BountyBoard:BidPlaced", async ({ event, context }) => {
  const { Bid } = context.db;
  await Bid.create({
    id: `${event.args.taskId.toString()}_${event.args.bidId.toString()}`,
    data: {
      taskId: event.args.taskId.toString(),
      agentId: event.args.agentId,
      price: event.args.price,
      etaSeconds: 0, // Not in event
      active: true,
    },
  });
});

ponder.on("BountyBoard:WorkerSelected", async ({ event, context }) => {
  const { Task } = context.db;
  await Task.update({
    id: event.args.taskId.toString(),
    data: {
      selectedBidId: event.args.bidId,
      status: 1, // Assigned
    },
  });
});

ponder.on("BountyBoard:WorkSubmitted", async ({ event, context }) => {
  const { Task } = context.db;
  await Task.update({
    id: event.args.taskId.toString(),
    data: {
      evidenceHash: event.args.evidenceHash,
      status: 2, // Submitted
    },
  });
});

ponder.on("BountyBoard:VerdictSubmitted", async ({ event, context }) => {
  const { Task } = context.db;
  await Task.update({
    id: event.args.taskId.toString(),
    data: {
      status: event.args.passed ? 3 : 4, // Passed / Failed
      finalOutcome: event.args.passed ? 1 : 0,
    },
  });
});

ponder.on("BountyBoard:TaskFinalized", async ({ event, context }) => {
  const { Task } = context.db;
  await Task.update({
    id: event.args.taskId.toString(),
    data: {
      status: event.args.finalStatus,
    },
  });
});

ponder.on("AgentRegistry:AgentRegistered", async ({ event, context }) => {
  const { Agent } = context.db;
  await Agent.create({
    id: event.args.agentId.toString(),
    data: {
      owner: event.args.owner,
      payoutAddress: event.args.payoutAddress,
      metadataHash: "",
      active: true,
    },
  });
});

ponder.on("AgentRegistry:AgentUpdated", async ({ event, context }) => {
  const { Agent } = context.db;
  await Agent.update({
    id: event.args.agentId.toString(),
    data: {
      payoutAddress: event.args.payoutAddress,
      active: event.args.active,
    },
  });
});
