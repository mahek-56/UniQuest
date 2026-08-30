export const MOCK_COURSES = [
  {
    id: "cs-dbms-101",
    code: "CS-301",
    title: "Database Management Systems",
    subtitle: "From Relational Algebra to Distributed Query Optimization & ACID",
    description: "Master modern relational databases, SQL queries, ER modeling, B+ Trees indexing, 3NF/BCNF normalization, concurrency control, and distributed ACID transactions.",
    category: "Computer Science",
    department: "Computer Engineering",
    semester: "Semester 4",
    difficulty: "Intermediate",
    instructor: {
      name: "Dr. Elena Rostova",
      role: "Professor of Distributed Systems",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Elena&backgroundColor=0055DA",
      university: "MIT EdTech Fellow"
    },
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80",
    color: "#0055DA",
    accentColor: "#76D2DB",
    totalXP: 450,
    totalCoins: 120,
    estimatedHours: 18,
    enrolledCount: 1420,
    rating: 4.9,
    progress: 45,
    modules: [
      {
        id: "mod-dbms-1",
        title: "Relational Data Model & ER Modeling",
        description: "Understand entity-relationship diagrams, cardinalities, relational schemas, and keys.",
        duration: "45 mins",
        xp: 100,
        lessons: [
          {
            id: "les-dbms-101",
            title: "Introduction to Relational Concepts & Keys",
            duration: "12 mins",
            xp: 20,
            completed: true,
            content: `# Introduction to Relational Concepts & Keys

In relational databases, data is organized into tables (relations) consisting of rows (tuples) and columns (attributes).

## Key Definitions

- **Super Key**: A set of one or more attributes that uniquely identifies a record.
- **Candidate Key**: A minimal super key (no unnecessary attributes).
- **Primary Key**: A chosen candidate key that uniquely identifies each entity in a table. It cannot contain \`NULL\` values.
- **Foreign Key**: An attribute that creates a link between tables by referencing the primary key of another table.

\`\`\`sql
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_code VARCHAR(10) REFERENCES Departments(code),
    gpa DECIMAL(3,2) CHECK (gpa >= 0.0 AND gpa <= 4.0)
);
\`\`\`

## Key Takeaway
Choosing proper primary and foreign keys prevents data anomalies and enforces referential integrity across your relational database.`
          },
          {
            id: "les-dbms-102",
            title: "ER Diagrams & Mapping to Tables",
            duration: "15 mins",
            xp: 20,
            completed: true,
            content: `# Entity-Relationship (ER) Diagrams & Mapping

ER Modeling is a conceptual design tool used to represent real-world entities, their attributes, and relationships.

### Cardinality Ratios
1. **One-to-One (1:1)**: e.g., Student has one Student ID card.
2. **One-to-Many (1:N)**: e.g., Department has many Students.
3. **Many-to-Many (M:N)**: e.g., Students enroll in many Courses (requires a junction table).

\`\`\`sql
-- Junction Table for Many-to-Many Relationship
CREATE TABLE Enrollments (
    student_id INT REFERENCES Students(student_id),
    course_id INT REFERENCES Courses(course_id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, course_id)
);
\`\`\`

> [!TIP]
> Always resolve M:N relationships using an associative junction table with a composite primary key.`
          },
          {
            id: "les-dbms-103",
            title: "Relational Algebra Operations",
            duration: "18 mins",
            xp: 20,
            completed: false,
            content: `# Relational Algebra Fundamentals

Relational algebra is a procedural query language that takes one or two relations as input and produces a new relation as output.

### Fundamental Operators
- **Selection (σ)**: Filters rows that satisfy a condition. \`σ_{gpa > 3.5}(Students)\`
- **Projection (π)**: Selects specific columns. \`π_{name, gpa}(Students)\`
- **Cartesian Product (✕)**: Combines every tuple of relation R with relation S.
- **Natural Join (⋈)**: Combines tuples with matching common attributes.
- **Set Union (∪)** and **Set Difference (−)**.

\`\`\`sql
-- SQL equivalent of π_{name}(σ_{department='CS'}(Students))
SELECT name 
FROM Students 
WHERE department = 'CS';
\`\`\`

Understand that modern SQL query optimizers convert SQL into relational algebra expression trees before generating physical execution plans.`
          }
        ],
        quiz: {
          id: "quiz-dbms-1",
          title: "Checkpoint: Relational Model & ER Design",
          questionsCount: 5,
          xpReward: 30,
          passScore: 70,
          completed: true,
          score: 100
        }
      },
      {
        id: "mod-dbms-2",
        title: "Functional Dependencies & Normalization (1NF to BCNF)",
        description: "Learn how to eliminate update, insertion, and deletion anomalies through systematic decomposition.",
        duration: "60 mins",
        xp: 150,
        lessons: [
          {
            id: "les-dbms-201",
            title: "Anomalies in Unnormalized Tables & 1NF",
            duration: "15 mins",
            xp: 20,
            completed: true,
            content: `# Database Anomalies and First Normal Form (1NF)

Unnormalized database tables suffer from three critical structural problems:

1. **Insertion Anomaly**: Inability to record certain information without adding unrelated data.
2. **Deletion Anomaly**: Unintentional loss of crucial data when a row is deleted.
3. **Update / Modification Anomaly**: Inconsistent data when updating redundant instances across multiple rows.

## 1NF Rules
- Each column must contain atomic (indivisible) values.
- No repeating groups or arrays stored in a single cell.
- Each record must have a unique identifier.`
          },
          {
            id: "les-dbms-202",
            title: "Second Normal Form (2NF) & Partial Dependency",
            duration: "20 mins",
            xp: 20,
            completed: false,
            content: `# 2NF & Partial Functional Dependencies

A relation is in **Second Normal Form (2NF)** if:
1. It is in 1NF.
2. Every non-prime attribute is **fully functionally dependent** on the entire primary key (no partial dependencies).

### Example of Partial Dependency
Consider \`R(StudentID, CourseID, StudentName, Grade)\` with Primary Key \`(StudentID, CourseID)\`.
- \`StudentID -> StudentName\` is a **Partial Dependency** because \`StudentName\` depends only on part of the composite primary key.

To reach 2NF, decompose into:
- \`Students(StudentID, StudentName)\`
- \`CourseEnrollments(StudentID, CourseID, Grade)\``
          },
          {
            id: "les-dbms-203",
            title: "Third Normal Form (3NF) & Boyce-Codd Normal Form (BCNF)",
            duration: "25 mins",
            xp: 20,
            completed: false,
            content: `# 3NF and BCNF Normalization

### 3NF Definition
A relation is in 3NF if for every functional dependency \`X -> Y\`:
- \`X -> Y\` is trivial (\`Y ⊆ X\`), OR
- \`X\` is a superkey, OR
- \`Y\` is a prime attribute (part of any candidate key).

This eliminates **Transitive Dependencies** (\`A -> B\` and \`B -> C\`).

### BCNF (Boyce-Codd Normal Form)
BCNF is a stricter version of 3NF. For every non-trivial functional dependency \`X -> Y\`:
- **\`X\` MUST be a superkey**. No exceptions for prime attributes.`
          }
        ],
        quiz: {
          id: "quiz-dbms-2",
          title: "Mastery Quiz: Normalization (1NF, 2NF, 3NF, BCNF)",
          questionsCount: 5,
          xpReward: 30,
          passScore: 75,
          completed: false,
          score: null
        }
      },
      {
        id: "mod-dbms-3",
        title: "Transactions, ACID Properties & Concurrency Control",
        description: "Delve into serializability, two-phase locking (2PL), deadlock prevention, and Write-Ahead Logging (WAL).",
        duration: "75 mins",
        xp: 200,
        lessons: [
          {
            id: "les-dbms-301",
            title: "ACID Properties & Transaction States",
            duration: "20 mins",
            xp: 20,
            completed: false,
            content: `# ACID Properties in Database Transactions

A transaction is a single logical unit of work.

- **Atomicity**: All operations succeed, or none do (All-or-Nothing).
- **Consistency**: The database moves from one valid state to another, preserving all constraints.
- **Isolation**: Concurrent transactions execute as if they were running serially without interference.
- **Durability**: Once committed, changes survive system failures and crashes.`
          }
        ],
        quiz: {
          id: "quiz-dbms-3",
          title: "Deep Dive: ACID & Concurrency Protocols",
          questionsCount: 6,
          xpReward: 40,
          passScore: 80,
          completed: false,
          score: null
        }
      }
    ]
  },
  {
    id: "cs-os-201",
    code: "CS-302",
    title: "Operating Systems & Concurrency",
    subtitle: "Kernel Architecture, Processes, Threads, Memory & Deadlocks",
    description: "Deep dive into CPU scheduling, virtual memory paging, semaphores, mutexes, condition variables, and deadlock detection algorithms like Banker's Algorithm.",
    category: "Computer Science",
    department: "Computer Engineering",
    semester: "Semester 4",
    difficulty: "Advanced",
    instructor: {
      name: "Prof. Marcus Thorne",
      role: "Kernel Architect & Systems Researcher",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Marcus&backgroundColor=FF0052",
      university: "Stanford Engineering Labs"
    },
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    color: "#FF0052",
    accentColor: "#FFD400",
    totalXP: 500,
    totalCoins: 140,
    estimatedHours: 22,
    enrolledCount: 1890,
    rating: 4.95,
    progress: 70,
    modules: [
      {
        id: "mod-os-1",
        title: "Processes, Threads & Inter-Process Communication",
        description: "Process Control Blocks (PCB), context switching, POSIX threads, pipes, and shared memory.",
        duration: "50 mins",
        xp: 120,
        lessons: [
          {
            id: "les-os-101",
            title: "Process Lifecycle & Context Switching",
            duration: "15 mins",
            xp: 20,
            completed: true,
            content: `# Process Lifecycle and Context Switching

A process is a program in execution. It includes program counter, stack, data section, and heap.

## Process States
1. **New**: The process is being created.
2. **Ready**: Waiting to be assigned to a CPU.
3. **Running**: Instructions are being executed.
4. **Waiting / Blocked**: Waiting for an I/O or event.
5. **Terminated**: Finished execution.`
          },
          {
            id: "les-os-102",
            title: "Threads vs Processes & Thread Safety",
            duration: "18 mins",
            xp: 20,
            completed: true,
            content: `# Multi-threading and Concurrency

Threads share code, data, and OS resources (like open files) within the same process, but maintain separate thread IDs, program counters, register sets, and stacks.`
          }
        ],
        quiz: {
          id: "quiz-os-1",
          title: "Process & Thread Scheduling Quiz",
          questionsCount: 5,
          xpReward: 30,
          passScore: 70,
          completed: true,
          score: 95
        }
      },
      {
        id: "mod-os-2",
        title: "Deadlocks & Banker's Algorithm",
        description: "The four Coffman conditions, resource allocation graphs, deadlock avoidance, and recovery.",
        duration: "65 mins",
        xp: 160,
        lessons: [
          {
            id: "les-os-201",
            title: "The 4 Coffman Conditions for Deadlocks",
            duration: "20 mins",
            xp: 20,
            completed: true,
            content: `# The 4 Coffman Conditions for Deadlocks

A deadlock occurs when a set of processes are blocked because each is holding a resource and waiting for another resource held by another process.

### The 4 Necessary Conditions:
1. **Mutual Exclusion**: At least one resource must be held in a non-shareable mode.
2. **Hold and Wait**: A process must hold at least one resource while waiting to acquire additional resources.
3. **No Preemption**: Resources cannot be forcibly taken from a process holding them; they must be released voluntarily.
4. **Circular Wait**: A closed chain of processes exists such that each process holds at least one resource needed by the next process in the chain.`
          },
          {
            id: "les-os-202",
            title: "Banker's Algorithm & Safe States",
            duration: "25 mins",
            xp: 20,
            completed: false,
            content: `# Banker's Algorithm for Deadlock Avoidance

The Banker's Algorithm tests for safety by simulating the allocation for predetermined maximum possible amounts of all resources, and then makes an s-state check to test for possible deadlocks before permitting the allocation.`
          }
        ],
        quiz: {
          id: "quiz-os-2",
          title: "Deadlock Avoidance & Banker's Challenge",
          questionsCount: 5,
          xpReward: 30,
          passScore: 80,
          completed: false,
          score: null
        }
      }
    ]
  },
  {
    id: "cs-aiml-301",
    code: "AI-401",
    title: "Applied Machine Learning & Neural Networks",
    subtitle: "From Linear Regression & Decision Trees to Backprop & Transformers",
    description: "Build intuition and implementation skills for Supervised Learning, Random Forests, Loss Functions, Gradient Descent, Backpropagation, and Attention Mechanisms.",
    category: "Artificial Intelligence",
    department: "Data Science & AI",
    semester: "Semester 5",
    difficulty: "Advanced",
    instructor: {
      name: "Dr. Anya Chen",
      role: "AI Research Scientist & Lead",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Anya&backgroundColor=00C68D",
      university: "DeepMind Academic Partner"
    },
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
    color: "#00C68D",
    accentColor: "#FFD400",
    totalXP: 550,
    totalCoins: 160,
    estimatedHours: 24,
    enrolledCount: 2310,
    rating: 4.98,
    progress: 20,
    modules: [
      {
        id: "mod-ai-1",
        title: "Foundations of Supervised Learning",
        description: "Gradient descent, loss functions, bias-variance tradeoff, and regularizations (L1/L2).",
        duration: "55 mins",
        xp: 130,
        lessons: [
          {
            id: "les-ai-101",
            title: "Gradient Descent Optimization & Learning Rates",
            duration: "18 mins",
            xp: 20,
            completed: true,
            content: `# Gradient Descent Optimization

Gradient descent is a first-order iterative optimization algorithm for finding a local minimum of a differentiable function.

\`\`\`python
import numpy as np

def gradient_descent(X, y, lr=0.01, epochs=1000):
    m, n = X.shape
    weights = np.zeros(n)
    bias = 0
    
    for _ in range(epochs):
        y_pred = np.dot(X, weights) + bias
        dw = (1/m) * np.dot(X.T, (y_pred - y))
        db = (1/m) * np.sum(y_pred - y)
        
        weights -= lr * dw
        bias -= lr * db
        
    return weights, bias
\`\`\`

## Key Takeaway
A learning rate that is too high causes divergence, while a learning rate that is too small leads to slow convergence or getting stuck in local plateaus.`
          }
        ],
        quiz: {
          id: "quiz-ai-1",
          title: "Supervised Learning Fundamentals",
          questionsCount: 5,
          xpReward: 30,
          passScore: 75,
          completed: false,
          score: null
        }
      }
    ]
  },
  {
    id: "cs-cn-401",
    code: "CS-304",
    title: "Computer Networks & Protocols",
    subtitle: "TCP/IP Stack, Subnetting, Routing Algorithms & Network Security",
    description: "Explore the 5-layer OSI/TCP-IP architecture: Ethernet, IP addressing, CIDR subnetting, BGP/OSPF routing, TCP flow/congestion control, DNS, and TLS cryptography.",
    category: "Computer Science",
    department: "Computer Engineering",
    semester: "Semester 4",
    difficulty: "Intermediate",
    instructor: {
      name: "Prof. Kenneth Wright",
      role: "Network Architect & RFC Contributor",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Kenneth&backgroundColor=36064D",
      university: "Cisco Certified Fellow"
    },
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    color: "#36064D",
    accentColor: "#76D2DB",
    totalXP: 420,
    totalCoins: 110,
    estimatedHours: 16,
    enrolledCount: 1180,
    rating: 4.85,
    progress: 0,
    modules: [
      {
        id: "mod-cn-1",
        title: "Transport Layer & Reliable Data Transfer",
        description: "TCP 3-way handshake, sliding window protocols, congestion window algorithms (Tahoe, Reno).",
        duration: "50 mins",
        xp: 110,
        lessons: [
          {
            id: "les-cn-101",
            title: "TCP 3-Way Handshake & Connection Teardown",
            duration: "15 mins",
            xp: 20,
            completed: false,
            content: `# TCP 3-Way Handshake (SYN -> SYN-ACK -> ACK)

Before transmitting application data over TCP, a full-duplex virtual connection is established via the three-way handshake.`
          }
        ],
        quiz: {
          id: "quiz-cn-1",
          title: "Transport Layer Diagnostics",
          questionsCount: 5,
          xpReward: 30,
          passScore: 70,
          completed: false,
          score: null
        }
      }
    ]
  },
  {
    id: "cs-dsa-101",
    code: "CS-201",
    title: "Data Structures & Algorithmic Quests",
    subtitle: "Arrays, Trees, Graphs, Dynamic Programming & Big-O",
    description: "Level up your problem-solving prowess! Master AVL Trees, Segment Trees, Dijkstra, A* Search, Disjoint Sets, and classic Dynamic Programming paradigms.",
    category: "Algorithms",
    department: "Computer Science",
    semester: "Semester 3",
    difficulty: "Beginner to Advanced",
    instructor: {
      name: "Dr. Sarah Jenkins",
      role: "ACM-ICPC Grandmaster Coach",
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Sarah&backgroundColor=FFD400",
      university: "Carnegie Mellon University"
    },
    thumbnail: "https://images.unsplash.com/photo-1516116211227-bbc13c74a367?w=800&auto=format&fit=crop&q=80",
    color: "#FFD400",
    accentColor: "#FF0052",
    totalXP: 600,
    totalCoins: 180,
    estimatedHours: 28,
    enrolledCount: 3410,
    rating: 4.97,
    progress: 85,
    modules: [
      {
        id: "mod-dsa-1",
        title: "Graph Traversal & Shortest Path Algorithms",
        description: "BFS, DFS, Dijkstra, Bellman-Ford, and Topological Sorting.",
        duration: "65 mins",
        xp: 150,
        lessons: [
          {
            id: "les-dsa-101",
            title: "Dijkstra's Algorithm with Min-Heap Priority Queue",
            duration: "20 mins",
            xp: 20,
            completed: true,
            content: `# Dijkstra's Shortest Path Algorithm

Dijkstra's algorithm finds the shortest path from a single source node to all other nodes in a graph with non-negative edge weights.

Time Complexity: **O((V + E) log V)** using a binary min-heap.`
          }
        ],
        quiz: {
          id: "quiz-dsa-1",
          title: "Graph Mastery Quest",
          questionsCount: 5,
          xpReward: 30,
          passScore: 80,
          completed: true,
          score: 100
        }
      }
    ]
  }
];
