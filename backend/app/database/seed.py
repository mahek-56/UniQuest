"""
Idempotent seed data for UniQuest.
Run with: python -m app.database.seed

Covers:
- Achievements
- Quests (daily)
- Rewards
- Courses (5 university subjects)
- Modules & Lessons
- Quizzes & Questions
- Demo user (for testing/demo)
- Revision topics for demo user

Running twice is safe — existing records are skipped by key/title checks.
"""

import asyncio
import sys
from datetime import date, datetime, timezone

# Ensure UTF-8 output on Windows console
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.database.session import AsyncSessionLocal


# ── Achievements ──────────────────────────────────────────────────────────────

ACHIEVEMENTS_SEED = [
    {
        "key": "first_lesson",
        "name": "First Step",
        "description": "Complete your very first lesson.",
        "icon": "🎓",
        "xp_reward": 50,
        "coin_reward": 10,
    },
    {
        "key": "first_quiz",
        "name": "Quiz Taker",
        "description": "Submit your first quiz attempt.",
        "icon": "📝",
        "xp_reward": 50,
        "coin_reward": 10,
    },
    {
        "key": "streak_7",
        "name": "Week Warrior",
        "description": "Maintain a 7-day study streak.",
        "icon": "🔥",
        "xp_reward": 150,
        "coin_reward": 50,
    },
    {
        "key": "streak_30",
        "name": "Month Master",
        "description": "Maintain a 30-day study streak.",
        "icon": "🏅",
        "xp_reward": 500,
        "coin_reward": 150,
    },
    {
        "key": "xp_1000",
        "name": "XP Hunter",
        "description": "Earn 1,000 total XP.",
        "icon": "⚡",
        "xp_reward": 100,
        "coin_reward": 30,
    },
    {
        "key": "xp_5000",
        "name": "XP Legend",
        "description": "Earn 5,000 total XP.",
        "icon": "🌟",
        "xp_reward": 300,
        "coin_reward": 100,
    },
    {
        "key": "perfect_quiz",
        "name": "Perfectionist",
        "description": "Score 100% on any quiz.",
        "icon": "💯",
        "xp_reward": 200,
        "coin_reward": 75,
    },
    {
        "key": "level_10",
        "name": "Rising Scholar",
        "description": "Reach Level 10.",
        "icon": "📈",
        "xp_reward": 200,
        "coin_reward": 50,
    },
    {
        "key": "quiz_master",
        "name": "Quiz Master",
        "description": "Complete 10 quizzes.",
        "icon": "🎯",
        "xp_reward": 250,
        "coin_reward": 80,
    },
    {
        "key": "ai_explorer",
        "name": "AI Explorer",
        "description": "Use the AI Tutor for the first time.",
        "icon": "🤖",
        "xp_reward": 75,
        "coin_reward": 20,
    },
    {
        "key": "fast_learner",
        "name": "Fast Learner",
        "description": "Complete 5 lessons in a single day.",
        "icon": "⚡",
        "xp_reward": 100,
        "coin_reward": 30,
    },
    {
        "key": "course_complete",
        "name": "Course Graduate",
        "description": "Complete an entire course.",
        "icon": "🏆",
        "xp_reward": 500,
        "coin_reward": 200,
    },
]


# ── Daily Quests ──────────────────────────────────────────────────────────────

QUESTS_SEED = [
    {
        "title": "Lesson Starter",
        "description": "Complete 1 lesson today.",
        "quest_type": "lesson_complete",
        "target_value": 1,
        "xp_reward": 20,
        "coin_reward": 5,
    },
    {
        "title": "Study Session",
        "description": "Complete 3 lessons today.",
        "quest_type": "lesson_complete",
        "target_value": 3,
        "xp_reward": 60,
        "coin_reward": 15,
    },
    {
        "title": "Quiz Challenger",
        "description": "Submit a quiz attempt.",
        "quest_type": "quiz_complete",
        "target_value": 1,
        "xp_reward": 40,
        "coin_reward": 10,
    },
    {
        "title": "Quiz Sharpshooter",
        "description": "Complete 2 quizzes today.",
        "quest_type": "quiz_complete",
        "target_value": 2,
        "xp_reward": 80,
        "coin_reward": 20,
    },
    {
        "title": "High Achiever",
        "description": "Score above 80% on a quiz.",
        "quest_type": "quiz_high_score",
        "target_value": 1,
        "xp_reward": 50,
        "coin_reward": 15,
    },
    {
        "title": "Revision Champion",
        "description": "Complete a spaced revision session.",
        "quest_type": "revision_complete",
        "target_value": 1,
        "xp_reward": 25,
        "coin_reward": 8,
    },
    {
        "title": "Deep Focus Hour",
        "description": "Study for at least 30 minutes in a session.",
        "quest_type": "study_session_30min",
        "target_value": 1,
        "xp_reward": 35,
        "coin_reward": 10,
    },
    {
        "title": "Streak Keeper",
        "description": "Maintain your daily streak.",
        "quest_type": "daily_login",
        "target_value": 1,
        "xp_reward": 15,
        "coin_reward": 5,
    },
]


# ── Rewards ───────────────────────────────────────────────────────────────────

REWARDS_SEED = [
    {
        "name": "Dark Theme",
        "description": "Unlock the UniQuest dark theme for a focused study experience.",
        "cost_coins": 100,
        "icon": "🌙",
    },
    {
        "name": "XP Booster (1 Day)",
        "description": "Earn 2× XP for all activities for 24 hours.",
        "cost_coins": 200,
        "icon": "⚡",
    },
    {
        "name": "Custom Avatar Frame",
        "description": "Unlock an exclusive gold avatar border.",
        "cost_coins": 150,
        "icon": "🖼️",
    },
    {
        "name": "Study Music Pack",
        "description": "Unlock lo-fi and focus music to study with.",
        "cost_coins": 75,
        "icon": "🎵",
    },
    {
        "name": "Streak Shield",
        "description": "Protect your streak once if you miss a day.",
        "cost_coins": 250,
        "icon": "🛡️",
    },
    {
        "name": "Coin Jackpot",
        "description": "Instantly receive 50 bonus coins.",
        "cost_coins": 300,
        "icon": "🪙",
    },
]


# ── Courses, Modules, Lessons ─────────────────────────────────────────────────

COURSES_SEED = [
    {
        "title": "Database Management Systems",
        "description": "Master relational databases, SQL, normalization, transactions, and query optimization. Essential for backend and data engineering roles.",
        "subject": "DBMS",
        "difficulty": "medium",
        "thumbnail_url": "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
        "is_published": True,
        "modules": [
            {
                "title": "Relational Model & SQL Fundamentals",
                "order_index": 0,
                "lessons": [
                    {"title": "Introduction to Relational Databases", "duration_minutes": 15, "xp_reward": 20, "content": "A relational database organizes data into tables (relations) with rows and columns. Each table represents an entity and relationships between tables are established through primary and foreign keys."},
                    {"title": "SQL SELECT, WHERE, and ORDER BY", "duration_minutes": 20, "xp_reward": 20, "content": "The SELECT statement retrieves data from one or more tables. Use WHERE to filter rows, ORDER BY to sort results, and LIMIT to restrict the number of rows returned."},
                    {"title": "JOINs: INNER, LEFT, RIGHT, FULL", "duration_minutes": 25, "xp_reward": 25, "content": "JOINs combine rows from two or more tables. INNER JOIN returns matching rows, LEFT JOIN includes all left rows, RIGHT JOIN all right rows, FULL OUTER JOIN all rows from both."},
                    {"title": "Aggregate Functions and GROUP BY", "duration_minutes": 20, "xp_reward": 20, "content": "Aggregate functions (COUNT, SUM, AVG, MAX, MIN) operate on groups of rows. Use GROUP BY to group rows and HAVING to filter groups."},
                ],
            },
            {
                "title": "Normalization & Design",
                "order_index": 1,
                "lessons": [
                    {"title": "Functional Dependencies", "duration_minutes": 20, "xp_reward": 20, "content": "A functional dependency X → Y means that for each value of X, there is exactly one value of Y. Functional dependencies are the foundation of normalization theory."},
                    {"title": "1NF, 2NF, and 3NF", "duration_minutes": 25, "xp_reward": 25, "content": "1NF: atomic values, no repeating groups. 2NF: 1NF + no partial dependencies on composite key. 3NF: 2NF + no transitive dependencies."},
                    {"title": "BCNF and Decomposition", "duration_minutes": 25, "xp_reward": 25, "content": "BCNF (Boyce-Codd Normal Form): For every non-trivial FD X → Y, X must be a superkey. BCNF is stricter than 3NF and eliminates all anomalies caused by FDs."},
                    {"title": "ER Diagrams to Relational Schema", "duration_minutes": 20, "xp_reward": 20, "content": "Entity-Relationship diagrams model the logical structure of a database. Converting ER to relational schema: entities become tables, attributes become columns, relationships become foreign keys."},
                ],
            },
            {
                "title": "Transactions & Concurrency",
                "order_index": 2,
                "lessons": [
                    {"title": "ACID Properties", "duration_minutes": 15, "xp_reward": 20, "content": "ACID: Atomicity (all-or-nothing), Consistency (valid state), Isolation (concurrent transactions don't interfere), Durability (committed data persists)."},
                    {"title": "Concurrency Problems & Isolation Levels", "duration_minutes": 20, "xp_reward": 20, "content": "Concurrency problems: dirty read, non-repeatable read, phantom read. SQL isolation levels: READ UNCOMMITTED, READ COMMITTED, REPEATABLE READ, SERIALIZABLE."},
                    {"title": "Indexing and Query Optimization", "duration_minutes": 25, "xp_reward": 25, "content": "Indexes speed up data retrieval using B-tree or hash structures. EXPLAIN ANALYZE in PostgreSQL shows query execution plans. Composite indexes vs single-column indexes."},
                ],
            },
        ],
        "quizzes": [
            {
                "title": "SQL Fundamentals Quiz",
                "subject": "DBMS",
                "difficulty": "easy",
                "pass_score": 60.0,
                "questions": [
                    {
                        "text": "Which SQL clause is used to filter rows after aggregation?",
                        "options": [{"key": "a", "text": "WHERE"}, {"key": "b", "text": "HAVING"}, {"key": "c", "text": "GROUP BY"}, {"key": "d", "text": "ORDER BY"}],
                        "correct_answer": "b",
                        "explanation": "HAVING is used to filter groups created by GROUP BY, similar to WHERE but for aggregate results.",
                    },
                    {
                        "text": "What does 3NF eliminate compared to 2NF?",
                        "options": [{"key": "a", "text": "Partial dependencies"}, {"key": "b", "text": "Repeating groups"}, {"key": "c", "text": "Transitive dependencies"}, {"key": "d", "text": "Multi-valued dependencies"}],
                        "correct_answer": "c",
                        "explanation": "3NF eliminates transitive dependencies: non-key attributes depending on other non-key attributes.",
                    },
                    {
                        "text": "In BCNF, for every non-trivial FD X → Y, X must be a:",
                        "options": [{"key": "a", "text": "Foreign key"}, {"key": "b", "text": "Candidate key"}, {"key": "c", "text": "Superkey"}, {"key": "d", "text": "Primary key"}],
                        "correct_answer": "c",
                        "explanation": "BCNF requires every determinant (left side of FD) to be a superkey, making it stricter than 3NF.",
                    },
                    {
                        "text": "Which JOIN returns all rows from the left table even if there's no match in the right?",
                        "options": [{"key": "a", "text": "INNER JOIN"}, {"key": "b", "text": "RIGHT JOIN"}, {"key": "c", "text": "FULL OUTER JOIN"}, {"key": "d", "text": "LEFT JOIN"}],
                        "correct_answer": "d",
                        "explanation": "LEFT JOIN (or LEFT OUTER JOIN) returns all rows from the left table and matching rows from the right. Non-matching right rows are NULL.",
                    },
                    {
                        "text": "Which ACID property guarantees committed data survives system failures?",
                        "options": [{"key": "a", "text": "Atomicity"}, {"key": "b", "text": "Consistency"}, {"key": "c", "text": "Isolation"}, {"key": "d", "text": "Durability"}],
                        "correct_answer": "d",
                        "explanation": "Durability ensures that once a transaction commits, it persists even in the event of a crash.",
                    },
                ],
            },
        ],
    },
    {
        "title": "Operating Systems",
        "description": "Deep dive into process management, memory, file systems, deadlocks, and CPU scheduling algorithms used in modern OS design.",
        "subject": "Operating Systems",
        "difficulty": "medium",
        "thumbnail_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
        "is_published": True,
        "modules": [
            {
                "title": "Processes & Threads",
                "order_index": 0,
                "lessons": [
                    {"title": "Process vs Thread", "duration_minutes": 15, "xp_reward": 20, "content": "A process is an independent program with its own memory space. A thread is a lightweight unit within a process sharing its memory. Threads enable concurrent execution within one process."},
                    {"title": "Process States and PCB", "duration_minutes": 20, "xp_reward": 20, "content": "Process states: New, Ready, Running, Waiting, Terminated. The Process Control Block (PCB) stores process state, program counter, registers, memory maps, and I/O status."},
                    {"title": "CPU Scheduling Algorithms", "duration_minutes": 25, "xp_reward": 25, "content": "FCFS, SJF, Round Robin, Priority Scheduling, Multilevel Queue. Key metrics: CPU utilization, throughput, turnaround time, waiting time, response time."},
                ],
            },
            {
                "title": "Memory Management",
                "order_index": 1,
                "lessons": [
                    {"title": "Paging and Page Tables", "duration_minutes": 20, "xp_reward": 20, "content": "Paging divides logical memory into fixed-size pages and physical memory into frames. The page table maps pages to frames. TLB (Translation Lookaside Buffer) caches recent translations."},
                    {"title": "Virtual Memory and Demand Paging", "duration_minutes": 25, "xp_reward": 25, "content": "Virtual memory allows execution of processes larger than physical memory. Demand paging loads pages only when needed. Page fault occurs when a requested page is not in memory."},
                    {"title": "Page Replacement Algorithms", "duration_minutes": 20, "xp_reward": 20, "content": "FIFO, LRU (Least Recently Used), Optimal (Belady's). LRU approximations: clock algorithm, second chance. Belady's anomaly: FIFO can increase page faults with more frames."},
                ],
            },
            {
                "title": "Deadlocks & Synchronization",
                "order_index": 2,
                "lessons": [
                    {"title": "Coffman Conditions for Deadlock", "duration_minutes": 20, "xp_reward": 20, "content": "Four necessary conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. ALL four must hold simultaneously for a deadlock to exist."},
                    {"title": "Banker's Algorithm", "duration_minutes": 25, "xp_reward": 25, "content": "Banker's algorithm avoids deadlock by granting resources only if a safe sequence exists. It checks if the system can reach a safe state where all processes can finish."},
                    {"title": "Semaphores and Mutex", "duration_minutes": 20, "xp_reward": 20, "content": "Semaphore: integer variable with P (wait) and V (signal) operations. Binary semaphore = mutex. Used to solve classic problems: Producer-Consumer, Readers-Writers, Dining Philosophers."},
                ],
            },
        ],
        "quizzes": [
            {
                "title": "Operating Systems Core Quiz",
                "subject": "Operating Systems",
                "difficulty": "medium",
                "pass_score": 60.0,
                "questions": [
                    {
                        "text": "Which of the following is NOT one of the four Coffman conditions for deadlock?",
                        "options": [{"key": "a", "text": "Mutual Exclusion"}, {"key": "b", "text": "Hold and Wait"}, {"key": "c", "text": "Preemption"}, {"key": "d", "text": "Circular Wait"}],
                        "correct_answer": "c",
                        "explanation": "The four Coffman conditions are: Mutual Exclusion, Hold and Wait, NO Preemption, and Circular Wait. Preemption must be ABSENT, not present.",
                    },
                    {
                        "text": "In Round Robin scheduling, what happens when a process's time quantum expires?",
                        "options": [{"key": "a", "text": "It is terminated"}, {"key": "b", "text": "It moves to the blocked queue"}, {"key": "c", "text": "It is placed at the end of the ready queue"}, {"key": "d", "text": "It immediately restarts"}],
                        "correct_answer": "c",
                        "explanation": "When the time quantum expires, the running process is preempted and placed at the tail of the ready queue, and the next process runs.",
                    },
                    {
                        "text": "Belady's anomaly is associated with which page replacement algorithm?",
                        "options": [{"key": "a", "text": "LRU"}, {"key": "b", "text": "Optimal"}, {"key": "c", "text": "FIFO"}, {"key": "d", "text": "Clock"}],
                        "correct_answer": "c",
                        "explanation": "Belady's anomaly: with FIFO, increasing the number of frames can sometimes INCREASE page faults. LRU and Optimal don't suffer from this.",
                    },
                    {
                        "text": "What does the Banker's Algorithm check before granting a resource request?",
                        "options": [{"key": "a", "text": "Whether the process has enough coins"}, {"key": "b", "text": "Whether the system will remain in a safe state"}, {"key": "c", "text": "Whether the process is the highest priority"}, {"key": "d", "text": "Whether the resource is currently free"}],
                        "correct_answer": "b",
                        "explanation": "The Banker's Algorithm grants a request only if the resulting state is 'safe' — meaning there exists a sequence in which all processes can complete.",
                    },
                    {
                        "text": "A binary semaphore is functionally equivalent to:",
                        "options": [{"key": "a", "text": "A counting semaphore with max value 10"}, {"key": "b", "text": "A mutex lock"}, {"key": "c", "text": "A monitor"}, {"key": "d", "text": "A condition variable"}],
                        "correct_answer": "b",
                        "explanation": "A binary semaphore has values 0 or 1, making it functionally equivalent to a mutex lock used for mutual exclusion.",
                    },
                ],
            },
        ],
    },
    {
        "title": "Data Structures & Algorithms",
        "description": "Build strong foundations in sorting, searching, graph algorithms, dynamic programming, and complexity analysis for competitive programming and interviews.",
        "subject": "DSA",
        "difficulty": "hard",
        "thumbnail_url": "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
        "is_published": True,
        "modules": [
            {
                "title": "Arrays, Linked Lists & Stacks",
                "order_index": 0,
                "lessons": [
                    {"title": "Arrays and Time Complexity", "duration_minutes": 15, "xp_reward": 20, "content": "Arrays provide O(1) random access and O(n) search. Dynamic arrays (like Python lists) double in size when full — amortized O(1) append. Cache-friendly due to contiguous memory."},
                    {"title": "Linked Lists: Singly and Doubly", "duration_minutes": 20, "xp_reward": 20, "content": "Singly linked list: O(1) insert at head, O(n) search. Doubly linked list: O(1) insert/delete at both ends. Used in LRU cache implementation."},
                    {"title": "Stacks and Queues", "duration_minutes": 15, "xp_reward": 20, "content": "Stack: LIFO (Last In First Out). Queue: FIFO. Applications: stack for function calls/backtracking, queue for BFS. Deque supports O(1) at both ends."},
                ],
            },
            {
                "title": "Sorting & Searching",
                "order_index": 1,
                "lessons": [
                    {"title": "Sorting Algorithms: Merge Sort & Quick Sort", "duration_minutes": 25, "xp_reward": 25, "content": "Merge Sort: O(n log n) always, stable, O(n) space. Quick Sort: O(n log n) avg, O(n²) worst, in-place. Randomized Quick Sort avoids worst-case. Heap Sort: O(n log n) in-place."},
                    {"title": "Binary Search & Variations", "duration_minutes": 20, "xp_reward": 20, "content": "Binary search: O(log n) on sorted arrays. Variations: lower_bound, upper_bound, search in rotated array. Template: lo, hi, mid = (lo+hi)//2, invariant maintenance."},
                ],
            },
            {
                "title": "Graphs & Dynamic Programming",
                "order_index": 2,
                "lessons": [
                    {"title": "Graph Representation & BFS/DFS", "duration_minutes": 25, "xp_reward": 25, "content": "Graph representations: adjacency list (sparse) vs matrix (dense). BFS: shortest path in unweighted graph, O(V+E). DFS: cycle detection, topological sort, O(V+E)."},
                    {"title": "Dijkstra's Shortest Path", "duration_minutes": 25, "xp_reward": 25, "content": "Dijkstra: O((V+E) log V) with priority queue. Greedy: always relaxes minimum distance vertex. Only works with non-negative edge weights. Bellman-Ford handles negative edges."},
                    {"title": "Dynamic Programming Fundamentals", "duration_minutes": 30, "xp_reward": 30, "content": "DP: break problem into overlapping subproblems with optimal substructure. Memoization (top-down) vs tabulation (bottom-up). Classic problems: 0/1 Knapsack, LCS, LIS, Matrix Chain."},
                ],
            },
        ],
        "quizzes": [
            {
                "title": "Algorithms Mastery Quiz",
                "subject": "DSA",
                "difficulty": "hard",
                "pass_score": 60.0,
                "questions": [
                    {
                        "text": "What is the worst-case time complexity of Quick Sort?",
                        "options": [{"key": "a", "text": "O(n log n)"}, {"key": "b", "text": "O(n²)"}, {"key": "c", "text": "O(n)"}, {"key": "d", "text": "O(log n)"}],
                        "correct_answer": "b",
                        "explanation": "Quick Sort's worst case is O(n²) when the pivot is always the smallest or largest element (sorted/reverse-sorted input). Randomized pivot avoids this.",
                    },
                    {
                        "text": "Which algorithm finds the shortest path in a weighted graph with non-negative weights?",
                        "options": [{"key": "a", "text": "BFS"}, {"key": "b", "text": "DFS"}, {"key": "c", "text": "Dijkstra's"}, {"key": "d", "text": "Bellman-Ford"}],
                        "correct_answer": "c",
                        "explanation": "Dijkstra's algorithm finds single-source shortest paths efficiently with non-negative weights using a priority queue. BFS works only for unweighted graphs.",
                    },
                    {
                        "text": "What property must a problem have for Dynamic Programming to be applicable?",
                        "options": [{"key": "a", "text": "Greedy choice property only"}, {"key": "b", "text": "Overlapping subproblems and optimal substructure"}, {"key": "c", "text": "Sorted input"}, {"key": "d", "text": "O(n log n) complexity"}],
                        "correct_answer": "b",
                        "explanation": "DP applies when: (1) optimal substructure — optimal solution contains optimal sub-solutions, and (2) overlapping subproblems — same subproblems solved multiple times.",
                    },
                    {
                        "text": "Binary search requires the input array to be:",
                        "options": [{"key": "a", "text": "Unsorted"}, {"key": "b", "text": "Sorted"}, {"key": "c", "text": "Unique elements only"}, {"key": "d", "text": "Indexed from 1"}],
                        "correct_answer": "b",
                        "explanation": "Binary search only works on sorted arrays. It eliminates half the search space each step, achieving O(log n) time.",
                    },
                ],
            },
        ],
    },
    {
        "title": "Computer Networks",
        "description": "Understand the OSI model, TCP/IP stack, routing protocols, DNS, HTTP/HTTPS, and network security fundamentals.",
        "subject": "Computer Networks",
        "difficulty": "medium",
        "thumbnail_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400",
        "is_published": True,
        "modules": [
            {
                "title": "OSI and TCP/IP Models",
                "order_index": 0,
                "lessons": [
                    {"title": "OSI 7-Layer Model", "duration_minutes": 20, "xp_reward": 20, "content": "OSI layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. Mnemonic: 'Please Do Not Throw Sausage Pizza Away'. Each layer adds a header (encapsulation)."},
                    {"title": "TCP vs UDP", "duration_minutes": 20, "xp_reward": 20, "content": "TCP: connection-oriented, reliable, ordered, flow/congestion control. 3-way handshake: SYN, SYN-ACK, ACK. UDP: connectionless, unreliable, fast. Used for DNS, DHCP, streaming, gaming."},
                    {"title": "IP Addressing and Subnetting", "duration_minutes": 25, "xp_reward": 25, "content": "IPv4: 32-bit address in dotted decimal. CIDR notation: 192.168.1.0/24. Subnetting divides network into smaller blocks. IPv6: 128-bit, colon-hex notation."},
                ],
            },
            {
                "title": "Application Layer Protocols",
                "order_index": 1,
                "lessons": [
                    {"title": "HTTP, HTTPS, and REST", "duration_minutes": 20, "xp_reward": 20, "content": "HTTP: stateless request-response protocol. Methods: GET, POST, PUT, DELETE, PATCH. Status codes: 2xx success, 3xx redirect, 4xx client error, 5xx server error. HTTPS adds TLS encryption."},
                    {"title": "DNS: Domain Name System", "duration_minutes": 15, "xp_reward": 20, "content": "DNS translates domain names to IP addresses. Hierarchy: Root servers → TLD servers → Authoritative servers. DNS records: A, AAAA, CNAME, MX, TXT. Caching with TTL."},
                ],
            },
        ],
        "quizzes": [
            {
                "title": "Computer Networks Quiz",
                "subject": "Computer Networks",
                "difficulty": "medium",
                "pass_score": 60.0,
                "questions": [
                    {
                        "text": "Which layer of the OSI model handles end-to-end communication and reliability?",
                        "options": [{"key": "a", "text": "Network Layer"}, {"key": "b", "text": "Data Link Layer"}, {"key": "c", "text": "Transport Layer"}, {"key": "d", "text": "Session Layer"}],
                        "correct_answer": "c",
                        "explanation": "The Transport Layer (Layer 4) provides end-to-end communication, error recovery, and flow control. TCP and UDP operate at this layer.",
                    },
                    {
                        "text": "What is the correct order of TCP's 3-way handshake?",
                        "options": [{"key": "a", "text": "SYN → ACK → SYN-ACK"}, {"key": "b", "text": "SYN → SYN-ACK → ACK"}, {"key": "c", "text": "ACK → SYN → SYN-ACK"}, {"key": "d", "text": "SYN-ACK → SYN → ACK"}],
                        "correct_answer": "b",
                        "explanation": "TCP 3-way handshake: Client sends SYN → Server replies SYN-ACK → Client sends ACK. This establishes a reliable connection.",
                    },
                    {
                        "text": "Which protocol resolves domain names to IP addresses?",
                        "options": [{"key": "a", "text": "DHCP"}, {"key": "b", "text": "ARP"}, {"key": "c", "text": "DNS"}, {"key": "d", "text": "ICMP"}],
                        "correct_answer": "c",
                        "explanation": "DNS (Domain Name System) translates human-readable domain names like google.com into IP addresses like 142.250.80.46.",
                    },
                ],
            },
        ],
    },
    {
        "title": "Artificial Intelligence & Machine Learning",
        "description": "From linear regression to neural networks — learn the core ML algorithms, evaluation metrics, and AI concepts used in real-world applications.",
        "subject": "AI/ML",
        "difficulty": "hard",
        "thumbnail_url": "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400",
        "is_published": True,
        "modules": [
            {
                "title": "Machine Learning Fundamentals",
                "order_index": 0,
                "lessons": [
                    {"title": "Supervised vs Unsupervised Learning", "duration_minutes": 15, "xp_reward": 20, "content": "Supervised: labeled training data → predict labels. Types: classification, regression. Unsupervised: unlabeled data → find structure. Types: clustering (K-means), dimensionality reduction (PCA)."},
                    {"title": "Linear Regression & Gradient Descent", "duration_minutes": 25, "xp_reward": 25, "content": "Linear regression: y = wx + b. Loss: MSE. Gradient descent: update weights in the direction of steepest loss decrease. Learning rate controls step size. Variants: SGD, Mini-batch, Adam."},
                    {"title": "Overfitting, Bias-Variance Tradeoff", "duration_minutes": 20, "xp_reward": 20, "content": "Overfitting: model fits training data too well but generalizes poorly. Underfitting: model too simple. Bias-variance tradeoff: high bias = underfitting, high variance = overfitting. Solutions: regularization, dropout, cross-validation."},
                ],
            },
            {
                "title": "Classification & Evaluation",
                "order_index": 1,
                "lessons": [
                    {"title": "Decision Trees and Random Forests", "duration_minutes": 25, "xp_reward": 25, "content": "Decision tree: splits data based on feature thresholds to maximize information gain (or minimize Gini impurity). Random Forest: ensemble of decision trees trained on bootstrapped subsets with random feature selection. Reduces overfitting."},
                    {"title": "Evaluation Metrics", "duration_minutes": 20, "xp_reward": 20, "content": "Accuracy, Precision, Recall, F1-Score, ROC-AUC. Precision = TP/(TP+FP). Recall = TP/(TP+FN). F1 = harmonic mean of P and R. Use F1 for imbalanced classes."},
                ],
            },
        ],
        "quizzes": [
            {
                "title": "Machine Learning Concepts Quiz",
                "subject": "AI/ML",
                "difficulty": "medium",
                "pass_score": 60.0,
                "questions": [
                    {
                        "text": "Which metric is most appropriate for an imbalanced classification dataset?",
                        "options": [{"key": "a", "text": "Accuracy"}, {"key": "b", "text": "F1-Score"}, {"key": "c", "text": "Mean Squared Error"}, {"key": "d", "text": "R-squared"}],
                        "correct_answer": "b",
                        "explanation": "With imbalanced classes, accuracy is misleading (predicting majority class gets high accuracy). F1-Score balances Precision and Recall, making it better for imbalanced datasets.",
                    },
                    {
                        "text": "Random Forest reduces overfitting compared to a single decision tree by:",
                        "options": [{"key": "a", "text": "Using deeper trees"}, {"key": "b", "text": "Averaging predictions of multiple trees trained on random subsets"}, {"key": "c", "text": "Applying L1 regularization"}, {"key": "d", "text": "Increasing learning rate"}],
                        "correct_answer": "b",
                        "explanation": "Random Forest uses bagging (bootstrap aggregating): trains multiple decision trees on random data subsets and averages/votes their predictions. This reduces variance and overfitting.",
                    },
                    {
                        "text": "What is the purpose of the learning rate in gradient descent?",
                        "options": [{"key": "a", "text": "Controls model complexity"}, {"key": "b", "text": "Sets the number of training epochs"}, {"key": "c", "text": "Determines the step size when updating weights"}, {"key": "d", "text": "Selects which features to use"}],
                        "correct_answer": "c",
                        "explanation": "The learning rate α controls how large each weight update step is. Too large → oscillates or diverges. Too small → slow convergence. Adaptive optimizers (Adam) adjust it automatically.",
                    },
                ],
            },
        ],
    },
]


# ── Demo user ─────────────────────────────────────────────────────────────────

DEMO_USER = {
    "email": "demo@uniquest.edu",
    "password": "UniQuest2024!",
    "full_name": "Alex Rivera",
    "university": "National Tech University",
    "department": "Computer Engineering",
    "semester": 5,
    "xp": 1240,
    "level": 12,
    "coins": 480,
    "onboarding_completed": True,
    "daily_study_target_minutes": 45,
    "target_grade": "A+",
    "interests": "Relational Databases, Distributed Systems, Machine Learning, Graph Algorithms",
    "preferred_study_time": "Evening (6 PM - 9 PM)",
}


# ── Seeder ────────────────────────────────────────────────────────────────────

async def seed_achievements(db: AsyncSession) -> int:
    from app.models.gamification import Achievement
    count = 0
    for data in ACHIEVEMENTS_SEED:
        existing = await db.execute(select(Achievement).where(Achievement.key == data["key"]))
        if existing.scalar_one_or_none():
            continue
        db.add(Achievement(
            key=data["key"],
            name=data["name"],
            description=data["description"],
            icon=data["icon"],
            xp_reward=data["xp_reward"],
            coin_reward=data["coin_reward"],
            created_at=datetime.now(tz=timezone.utc),
            updated_at=datetime.now(tz=timezone.utc),
        ))
        count += 1
    await db.commit()
    return count


async def seed_quests(db: AsyncSession) -> int:
    from app.models.gamification import Quest
    count = 0
    for data in QUESTS_SEED:
        existing = await db.execute(select(Quest).where(Quest.title == data["title"]))
        if existing.scalar_one_or_none():
            continue
        db.add(Quest(
            title=data["title"],
            description=data["description"],
            quest_type=data["quest_type"],
            target_value=data["target_value"],
            xp_reward=data["xp_reward"],
            coin_reward=data["coin_reward"],
            is_daily=True,
            is_active=True,
            created_at=datetime.now(tz=timezone.utc),
            updated_at=datetime.now(tz=timezone.utc),
        ))
        count += 1
    await db.commit()
    return count


async def seed_rewards(db: AsyncSession) -> int:
    from app.models.gamification import Reward
    count = 0
    for data in REWARDS_SEED:
        existing = await db.execute(select(Reward).where(Reward.name == data["name"]))
        if existing.scalar_one_or_none():
            continue
        db.add(Reward(
            name=data["name"],
            description=data["description"],
            cost_coins=data["cost_coins"],
            icon=data["icon"],
            is_active=True,
            created_at=datetime.now(tz=timezone.utc),
            updated_at=datetime.now(tz=timezone.utc),
        ))
        count += 1
    await db.commit()
    return count


async def seed_courses(db: AsyncSession) -> int:
    from app.models.course import Course, Module, Lesson
    from app.models.quiz import Quiz, Question
    count = 0
    for course_data in COURSES_SEED:
        # Check if course already exists
        existing = await db.execute(select(Course).where(Course.title == course_data["title"]))
        if existing.scalar_one_or_none():
            continue

        now = datetime.now(tz=timezone.utc)
        course = Course(
            title=course_data["title"],
            description=course_data["description"],
            subject=course_data["subject"],
            difficulty=course_data["difficulty"],
            thumbnail_url=course_data.get("thumbnail_url"),
            is_published=course_data["is_published"],
            created_at=now,
            updated_at=now,
        )
        db.add(course)
        await db.flush()

        for mod_data in course_data.get("modules", []):
            module = Module(
                course_id=course.id,
                title=mod_data["title"],
                order_index=mod_data["order_index"],
                created_at=now,
                updated_at=now,
            )
            db.add(module)
            await db.flush()

            for lesson_idx, lesson_data in enumerate(mod_data.get("lessons", [])):
                lesson = Lesson(
                    module_id=module.id,
                    title=lesson_data["title"],
                    content=lesson_data.get("content", ""),
                    duration_minutes=lesson_data.get("duration_minutes", 15),
                    xp_reward=lesson_data.get("xp_reward", 20),
                    order_index=lesson_idx,
                    created_at=now,
                    updated_at=now,
                )
                db.add(lesson)

        for quiz_data in course_data.get("quizzes", []):
            quiz = Quiz(
                title=quiz_data["title"],
                subject=quiz_data["subject"],
                difficulty=quiz_data["difficulty"],
                pass_score=quiz_data["pass_score"],
                created_at=now,
                updated_at=now,
            )
            db.add(quiz)
            await db.flush()

            for q_idx, q_data in enumerate(quiz_data.get("questions", [])):
                question = Question(
                    quiz_id=quiz.id,
                    text=q_data["text"],
                    options=q_data["options"],
                    correct_answer=q_data["correct_answer"],
                    explanation=q_data.get("explanation", ""),
                    order_index=q_idx,
                )
                db.add(question)

        count += 1

    await db.commit()
    return count


async def seed_demo_user(db: AsyncSession) -> bool:
    from app.models.user import User
    from app.models.gamification import Streak

    existing = await db.execute(select(User).where(User.email == DEMO_USER["email"]))
    if existing.scalar_one_or_none():
        return False  # already exists

    now = datetime.now(tz=timezone.utc)
    user = User(
        email=DEMO_USER["email"],
        hashed_password=hash_password(DEMO_USER["password"]),
        full_name=DEMO_USER["full_name"],
        university=DEMO_USER["university"],
        department=DEMO_USER["department"],
        semester=DEMO_USER["semester"],
        xp=DEMO_USER["xp"],
        level=DEMO_USER["level"],
        coins=DEMO_USER["coins"],
        onboarding_completed=DEMO_USER["onboarding_completed"],
        daily_study_target_minutes=DEMO_USER["daily_study_target_minutes"],
        target_grade=DEMO_USER["target_grade"],
        interests=DEMO_USER["interests"],
        preferred_study_time=DEMO_USER["preferred_study_time"],
        role="student",
        is_active=True,
        created_at=now,
        updated_at=now,
    )
    db.add(user)
    await db.flush()

    db.add(Streak(
        user_id=user.id,
        current_streak=7,
        longest_streak=14,
        last_active_date=date.today(),
    ))

    await db.commit()
    print(f"  ✓ Demo user created: {DEMO_USER['email']} / {DEMO_USER['password']}")
    return True


async def run_seed(reset: bool = False):
    """Main seed runner."""
    print("🌱 UniQuest Seed Data Runner")
    print("=" * 40)

    if reset:
        print("Resetting database schema (dropping old tables)...", end=" ")
        from sqlalchemy import text
        from app.database.session import engine
        async with engine.begin() as conn:
            # Drop public schema and recreate it cleanly for PostgreSQL
            if engine.dialect.name == "postgresql":
                await conn.execute(text("DROP SCHEMA public CASCADE"))
                await conn.execute(text("CREATE SCHEMA public"))
            else:
                from app.database.init_db import drop_tables
                await drop_tables()
        print("✓ Done")

    # Ensure tables exist
    from app.database.init_db import create_tables
    await create_tables()

    async with AsyncSessionLocal() as db:
        print("Seeding achievements...", end=" ")
        n = await seed_achievements(db)
        print(f"✓ {n} new records")

        print("Seeding quests...", end=" ")
        n = await seed_quests(db)
        print(f"✓ {n} new records")

        print("Seeding rewards...", end=" ")
        n = await seed_rewards(db)
        print(f"✓ {n} new records")

        print("Seeding courses, modules, lessons, quizzes...", end=" ")
        n = await seed_courses(db)
        print(f"✓ {n} new courses")

        print("Seeding demo user...", end=" ")
        created = await seed_demo_user(db)
        if not created:
            print("✓ already exists (skipped)")

    print("=" * 40)
    print("✅ Seed complete! Safe to run again — duplicates are skipped.")
    print(f"\nDemo credentials:\n  Email: {DEMO_USER['email']}\n  Password: {DEMO_USER['password']}")


if __name__ == "__main__":
    reset_flag = "--reset" in sys.argv or "-r" in sys.argv
    asyncio.run(run_seed(reset=reset_flag))

