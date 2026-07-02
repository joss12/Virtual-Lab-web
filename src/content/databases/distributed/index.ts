import * as distributedConsensus from "./distributed-consensus";
import * as paxos from "./paxos";
import * as capTheorem from "./cap-theorem";
import * as replicationStrategies from "./replication-strategies";
import * as sharding from "./sharding";
import * as distributedTransactions from "./distributed-transactions";
import * as spannerCockroachdb from "./spanner-cockroachdb";

export const distributedLessons = [
  {
    id: "distributed-consensus",
    title: "Distributed Consensus",
    content: distributedConsensus.content,
    quiz: distributedConsensus.quiz,
  },
  {
    id: "paxos",
    title: "Paxos Algorithm",
    content: paxos.content,
    quiz: paxos.quiz,
  },
  {
    id: "cap-theorem",
    title: "CAP Theorem",
    content: capTheorem.content,
    quiz: capTheorem.quiz,
  },
  {
    id: "replication-strategies",
    title: "Replication Strategies",
    content: replicationStrategies.content,
    quiz: replicationStrategies.quiz,
  },
  {
    id: "sharding",
    title: "Sharding",
    content: sharding.content,
    quiz: sharding.quiz,
  },
  {
    id: "distributed-transactions",
    title: "Distributed Transactions",
    content: distributedTransactions.content,
    quiz: distributedTransactions.quiz,
  },
  {
    id: "spanner-cockroachdb",
    title: "Spanner & CockroachDB",
    content: spannerCockroachdb.content,
    quiz: spannerCockroachdb.quiz,
  },
];
