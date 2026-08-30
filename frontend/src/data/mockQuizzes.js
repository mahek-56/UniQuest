export const MOCK_QUIZZES = {
  "quiz-dbms-2": {
    id: "quiz-dbms-2",
    courseId: "cs-dbms-101",
    courseTitle: "Database Management Systems",
    title: "Mastery Quiz: Normalization (1NF, 2NF, 3NF, BCNF)",
    description: "Test your functional dependency decomposition skills, superkey identification, and normal form validation.",
    durationMinutes: 15,
    passPercentage: 75,
    xpReward: 40,
    coinReward: 20,
    questions: [
      {
        id: "q-dbms-1",
        text: "Given relation R(A, B, C, D) with functional dependencies {A -> B, B -> C, C -> D}. What is the highest normal form satisfied by R if A is the candidate key?",
        options: [
          "1NF only",
          "2NF only",
          "3NF",
          "BCNF"
        ],
        correctIndex: 1,
        explanation: "Since A is the single-attribute candidate key, there are no partial dependencies (satisfying 2NF). However, A -> B and B -> C creates a transitive dependency where non-prime attribute C depends on non-superkey B, violating 3NF. Thus, R is in 2NF only."
      },
      {
        id: "q-dbms-2",
        text: "What condition is REQUIRED for a relation to be in Boyce-Codd Normal Form (BCNF) that distinguishes it from 3NF?",
        options: [
          "Every determinant must be a candidate key / superkey without exception",
          "All multi-valued dependencies must be eliminated",
          "Non-prime attributes can depend on another non-prime attribute",
          "Primary keys must have at least two composite columns"
        ],
        correctIndex: 0,
        explanation: "BCNF strictly requires that for every non-trivial functional dependency X -> Y, X MUST be a superkey. Unlike 3NF, BCNF does not allow exceptions for Y being a prime attribute."
      },
      {
        id: "q-dbms-3",
        text: "Which of the following database anomalies occurs when deleting a row inadvertently destroys other unrelated crucial data?",
        options: [
          "Update Anomaly",
          "Insertion Anomaly",
          "Deletion Anomaly",
          "Dirty Read Anomaly"
        ],
        correctIndex: 2,
        explanation: "A Deletion Anomaly happens when unnormalized tables combine multiple concepts, causing the deletion of one record to erase the only existing copy of another vital entity."
      },
      {
        id: "q-dbms-4",
        text: "Consider relation R(StudentID, CourseID, Professor, OfficeNumber) where (StudentID, CourseID) is the primary key and Professor -> OfficeNumber. What violation is present?",
        options: [
          "1NF Atomicity violation",
          "Partial Dependency violation (2NF)",
          "Transitive Dependency violation (3NF)",
          "Join Dependency violation"
        ],
        correctIndex: 2,
        explanation: "Professor is a non-prime attribute determining another non-prime attribute (OfficeNumber). Neither is part of the candidate key, making this a Transitive Dependency violating 3NF."
      },
      {
        id: "q-dbms-5",
        text: "When decomposing a relation into 3NF, what two fundamental properties MUST always be preserved?",
        options: [
          "Lossless Join and Dependency Preservation",
          "Zero Redundancy and Single Table Storage",
          "Multi-threading and Locking Safety",
          "Denormalization and Faster Reads"
        ],
        correctIndex: 0,
        explanation: "3NF synthesis algorithms guarantee both Lossless (non-additive) Join decomposition and Full Dependency Preservation."
      }
    ]
  },
  "quiz-os-2": {
    id: "quiz-os-2",
    courseId: "cs-os-201",
    courseTitle: "Operating Systems & Concurrency",
    title: "Deadlock Avoidance & Banker's Challenge",
    description: "Evaluate your ability to detect deadlock states, calculate Allocation & Need matrices, and ensure safe execution sequences.",
    durationMinutes: 12,
    passPercentage: 80,
    xpReward: 40,
    coinReward: 20,
    questions: [
      {
        id: "q-os-1",
        text: "Which of the following is NOT one of the four Coffman conditions necessary for a deadlock?",
        options: [
          "Mutual Exclusion",
          "Hold and Wait",
          "Preemption Allowed",
          "Circular Wait"
        ],
        correctIndex: 2,
        explanation: "The condition is 'No Preemption' (resources cannot be preempted). Allowing preemption actively prevents deadlocks."
      },
      {
        id: "q-os-2",
        text: "In Banker's Algorithm, how is the 'Need' matrix calculated for each process Pi?",
        options: [
          "Need[i] = Max[i] - Allocation[i]",
          "Need[i] = Allocation[i] + Available",
          "Need[i] = Max[i] / Available",
          "Need[i] = TotalResources - Allocation[i]"
        ],
        correctIndex: 0,
        explanation: "The Need matrix represents remaining resource requests: Need[i][j] = Max[i][j] - Allocation[i][j]."
      },
      {
        id: "q-os-3",
        text: "If a system is in an 'Unsafe State', what does this strictly imply?",
        options: [
          "A deadlock is currently active right now",
          "A deadlock may occur in the future if processes request their maximum resources",
          "The system will crash immediately",
          "All processes are blocked"
        ],
        correctIndex: 1,
        explanation: "An unsafe state is not guaranteed to be deadlocked immediately; rather, it is a state from which the OS cannot guarantee avoiding a deadlock if all processes make their maximum resource requests."
      },
      {
        id: "q-os-4",
        text: "How does resource ordering (assigning global linear IDs to all resources) prevent deadlocks?",
        options: [
          "By invalidating the Mutual Exclusion condition",
          "By invalidating the Circular Wait condition",
          "By forcing preemptive CPU scheduling",
          "By multiplying available memory"
        ],
        correctIndex: 1,
        explanation: "Enforcing that processes request resources strictly in increasing order of their numerical ID breaks any potential circular wait chain."
      },
      {
        id: "q-os-5",
        text: "What data structure can represent process resource requests and allocations to detect deadlocks in single-instance resource systems?",
        options: [
          "Binary Search Tree",
          "Resource Allocation Graph (RAG) / Wait-For Graph",
          "Hash Map with Chaining",
          "Segment Tree"
        ],
        correctIndex: 1,
        explanation: "A cycle in a Wait-For Graph (or single-unit Resource Allocation Graph) is necessary and sufficient condition for a deadlock."
      }
    ]
  },
  "quiz-ai-1": {
    id: "quiz-ai-1",
    courseId: "cs-aiml-301",
    courseTitle: "Applied Machine Learning & Neural Networks",
    title: "Supervised Learning Fundamentals",
    description: "Assess understanding of gradient descent, cost functions, overfitting, and bias-variance tradeoff.",
    durationMinutes: 10,
    passPercentage: 75,
    xpReward: 35,
    coinReward: 15,
    questions: [
      {
        id: "q-ai-1",
        text: "What happens during gradient descent if the learning rate (alpha) is set too high?",
        options: [
          "It converges instantaneously to the global minimum",
          "It overshoots the minimum and may diverge",
          "It causes severe underfitting without changing weights",
          "The loss function becomes convex"
        ],
        correctIndex: 1,
        explanation: "A learning rate that is too large causes parameter updates to overshoot the valley floor, oscillating wildly and diverging."
      },
      {
        id: "q-ai-2",
        text: "A model with high variance and low bias typically suffers from which issue?",
        options: [
          "Underfitting on training data",
          "Overfitting the training data and failing to generalize to unseen test data",
          "Zero parameters",
          "Slow inference time due to small tree depth"
        ],
        correctIndex: 1,
        explanation: "High variance means the model is overly sensitive to fluctuations in the training set (capturing noise), leading to poor generalization."
      },
      {
        id: "q-ai-3",
        text: "What is the primary role of an activation function (e.g., ReLU, Sigmoid) in artificial neural networks?",
        options: [
          "To speed up disk I/O",
          "To introduce non-linearity, allowing the network to learn complex non-linear decision boundaries",
          "To convert integers into floating point numbers",
          "To reduce training dataset size"
        ],
        correctIndex: 1,
        explanation: "Without non-linear activation functions, any deep neural network would simply collapse into an equivalent single-layer linear model."
      },
      {
        id: "q-ai-4",
        text: "Which regularization technique adds the sum of absolute values of weights to the loss function?",
        options: [
          "L2 Regularization (Ridge)",
          "L1 Regularization (Lasso)",
          "Dropout",
          "Batch Normalization"
        ],
        correctIndex: 1,
        explanation: "L1 regularization (Lasso) uses the L1 norm ||w||_1 = sum(|w_i|), which tends to produce sparse weight vectors."
      },
      {
        id: "q-ai-5",
        text: "In binary classification with highly imbalanced classes (e.g. 99% negative, 1% positive), why is Accuracy a misleading metric?",
        options: [
          "Accuracy cannot be calculated on binary data",
          "A naive model predicting always 'negative' achieves 99% accuracy while detecting 0% of positive cases",
          "Precision and recall are always identical to accuracy",
          "Cross-entropy loss does not work"
        ],
        correctIndex: 1,
        explanation: "With heavy class imbalance, high accuracy can be achieved trivially by predicting the majority class. Precision, Recall, and F1-score or PR-AUC are far more meaningful."
      }
    ]
  },
  "quiz-dsa-1": {
    id: "quiz-dsa-1",
    courseId: "cs-dsa-101",
    courseTitle: "Data Structures & Algorithmic Quests",
    title: "Graph Mastery Quest",
    description: "Shortest paths, minimum spanning trees, and graph traversal complexities.",
    durationMinutes: 10,
    passPercentage: 80,
    xpReward: 40,
    coinReward: 20,
    questions: [
      {
        id: "q-dsa-1",
        text: "Why does standard Dijkstra's algorithm fail on graphs containing negative-weight edges?",
        options: [
          "It uses a FIFO queue instead of a stack",
          "It assumes that once a vertex is marked visited / extracted from the min-heap, its shortest path is permanently finalized",
          "It can only run on Directed Acyclic Graphs (DAGs)",
          "It runs in O(N!) factorial time"
        ],
        correctIndex: 1,
        explanation: "Dijkstra is greedy: once a node's distance is finalized, it is never reconsidered. A subsequent negative edge could yield a shorter path, breaking Dijkstra's invariant. Bellman-Ford must be used instead."
      },
      {
        id: "q-dsa-2",
        text: "What is the time complexity of Breadth-First Search (BFS) on a graph represented using an Adjacency List?",
        options: [
          "O(V + E)",
          "O(V * E)",
          "O(V^2)",
          "O(E log V)"
        ],
        correctIndex: 0,
        explanation: "BFS visits every vertex once (O(V)) and explores each edge once in directed or twice in undirected graphs (O(E)), giving total time O(V + E)."
      },
      {
        id: "q-dsa-3",
        text: "Which algorithm finds the Minimum Spanning Tree (MST) by greedily adding the lowest-weight edge that does not form a cycle?",
        options: [
          "Kruskal's Algorithm",
          "Floyd-Warshall Algorithm",
          "Kosaraju's Algorithm",
          "Tarjan's SCC Algorithm"
        ],
        correctIndex: 0,
        explanation: "Kruskal's algorithm sorts all edges by weight and uses a Disjoint Set Union (DSU / Union-Find) structure to avoid cycles."
      },
      {
        id: "q-dsa-4",
        text: "Topological Sort can be performed on which type of graph?",
        options: [
          "Any Undirected Graph",
          "Directed Acyclic Graph (DAG)",
          "Complete Graph with self-loops",
          "Cyclic Bipartite Graph"
        ],
        correctIndex: 1,
        explanation: "Topological sorting produces a linear ordering of vertices such that for every directed edge u -> v, u comes before v. This is only possible in DAGs."
      },
      {
        id: "q-dsa-5",
        text: "What is the worst-case space complexity of storing a dense graph with V vertices using an Adjacency Matrix?",
        options: [
          "O(V)",
          "O(V^2)",
          "O(V + E)",
          "O(E log V)"
        ],
        correctIndex: 1,
        explanation: "An adjacency matrix allocates a 2D array of size V x V, consuming O(V^2) memory regardless of edge density."
      }
    ]
  }
};
