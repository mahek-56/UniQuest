"""
Curated and verified real-world learning resources for academic subjects.
Includes NPTEL courses, high-quality YouTube lectures, official documentation,
and competitive practice platforms.
"""

from typing import Any

SUBJECT_RESOURCES: dict[str, list[dict[str, Any]]] = {
    "Database Management Systems": [
        {
            "id": "dbms-nptel-1",
            "title": "Database Management System",
            "provider": "NPTEL (IIT Kharagpur)",
            "instructor": "Prof. Partha Pratim Das",
            "type": "NPTEL Course",
            "icon": "🎓",
            "description": "Comprehensive university curriculum covering relational algebra, SQL, ER modeling, normal forms (1NF–BCNF), concurrency control, and ACID properties.",
            "url": "https://nptel.ac.in/courses/106105175",
            "difficulty": "Intermediate",
            "topics": ["Normalization", "Relational Algebra", "Transactions", "Indexing"],
        },
        {
            "id": "dbms-yt-1",
            "title": "DBMS Complete University & GATE Playlist",
            "provider": "Gate Smashers",
            "instructor": "Varun Singla",
            "type": "YouTube Playlist",
            "icon": "🎥",
            "description": "Visual, concise breakdown of B+ Trees, ACID transactions, 2PL locking protocols, conflict serializability, and SQL queries.",
            "url": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9CiB_M3gjb4JYxZ",
            "difficulty": "Beginner to Advanced",
            "topics": ["SQL", "Deadlocks", "Normalization", "B+ Trees"],
        },
        {
            "id": "dbms-doc-1",
            "title": "PostgreSQL 16 Documentation & SQL Reference",
            "provider": "PostgreSQL Global Development Group",
            "instructor": "Official Docs",
            "type": "Documentation",
            "icon": "📚",
            "description": "The definitive relational database manual for query optimization, MVCC internals, index structures, and SQL dialect standards.",
            "url": "https://www.postgresql.org/docs/current/",
            "difficulty": "Advanced",
            "topics": ["SQL Syntax", "Query Plans", "Indexes", "MVCC"],
        },
        {
            "id": "dbms-prac-1",
            "title": "SQLZoo Interactive Query Practice",
            "provider": "SQLZoo",
            "instructor": "Interactive Platform",
            "type": "Practice Platform",
            "icon": "💻",
            "description": "Hands-on SQL coding sandbox with assessments on JOINs, GROUP BY, subqueries, and window functions.",
            "url": "https://sqlzoo.net/wiki/SQL_Tutorial",
            "difficulty": "Beginner to Intermediate",
            "topics": ["Nested Queries", "Aggregate Functions", "Self JOINs"],
        },
    ],
    "Operating Systems": [
        {
            "id": "os-nptel-1",
            "title": "Operating System Fundamentals",
            "provider": "NPTEL (IIT Madras / IIT Kharagpur)",
            "instructor": "Prof. Chester Rebeiro / Prof. P.K. Biswas",
            "type": "NPTEL Course",
            "icon": "🎓",
            "description": "Rigorous treatment of CPU scheduling, virtual memory, paging/segmentation, IPC, mutex semaphores, and file system architecture.",
            "url": "https://nptel.ac.in/courses/106106144",
            "difficulty": "Intermediate",
            "topics": ["Process Scheduling", "Virtual Memory", "Deadlocks", "Paging"],
        },
        {
            "id": "os-yt-1",
            "title": "Operating Systems Master Course",
            "provider": "Gate Smashers & Neso Academy",
            "instructor": "Varun Singla",
            "type": "YouTube Playlist",
            "icon": "🎥",
            "description": "Clear step-by-step problem solving on Banker's Algorithm, Page Replacement (LRU/FIFO), Round Robin scheduling, and Peterson's Solution.",
            "url": "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p",
            "difficulty": "Beginner to Intermediate",
            "topics": ["Banker's Algorithm", "Semaphores", "Page Replacement"],
        },
        {
            "id": "os-doc-1",
            "title": "Linux Kernel Architecture Documentation",
            "provider": "The Linux Kernel Organization",
            "instructor": "Kernel Maintainers",
            "type": "Documentation",
            "icon": "📚",
            "description": "Deep-dive documentation into CFS task scheduling, memory management subsystem, and POSIX system call implementations.",
            "url": "https://www.kernel.org/doc/html/latest/",
            "difficulty": "Advanced",
            "topics": ["System Calls", "Memory Management", "Kernel Threads"],
        },
        {
            "id": "os-prac-1",
            "title": "Operating Systems: Three Easy Pieces (OSTEP)",
            "provider": "University of Wisconsin-Madison",
            "instructor": "Prof. Remzi Arpaci-Dusseau",
            "type": "Tutorial & Labs",
            "icon": "📝",
            "description": "Industry gold-standard free textbook with concurrency coding projects, xv6 kernel walkthroughs, and CPU virtualization exercises.",
            "url": "https://pages.cs.wisc.edu/~remzi/OSTEP/",
            "difficulty": "Intermediate",
            "topics": ["Virtualization", "Concurrency", "Persistence"],
        },
    ],
    "Data Structures & Algorithms": [
        {
            "id": "dsa-nptel-1",
            "title": "Data Structures and Algorithms",
            "provider": "NPTEL (IIT Delhi)",
            "instructor": "Prof. Naveen Garg",
            "type": "NPTEL Course",
            "icon": "🎓",
            "description": "Classic mathematical and algorithmic lectures on asymptotic analysis, balanced search trees (AVL/Red-Black), graph traversals, and dynamic programming.",
            "url": "https://nptel.ac.in/courses/106102064",
            "difficulty": "Advanced",
            "topics": ["Asymptotic Analysis", "AVL Trees", "Graph Algorithms", "DP"],
        },
        {
            "id": "dsa-yt-1",
            "title": "Algorithms & Dynamic Programming Mastery",
            "provider": "Abdul Bari",
            "instructor": "Abdul Bari",
            "type": "YouTube Playlist",
            "icon": "🎥",
            "description": "Renowned visual derivations of Greedy Methods, Dijkstra, Bellman-Ford, Floyd-Warshall, 0/1 Knapsack, and Divide-and-Conquer paradigms.",
            "url": "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O",
            "difficulty": "Intermediate",
            "topics": ["Dynamic Programming", "Greedy", "Dijkstra", "Divide & Conquer"],
        },
        {
            "id": "dsa-prac-1",
            "title": "LeetCode Top Interview 150 & Algorithm Study",
            "provider": "LeetCode",
            "instructor": "Coding Sandbox",
            "type": "Practice Platform",
            "icon": "💻",
            "description": "Curated algorithmic problem set spanning Two Pointers, Sliding Window, Trees, Graphs, Heap, Backtracking, and Dynamic Programming.",
            "url": "https://leetcode.com/problemset/all/",
            "difficulty": "All Levels",
            "topics": ["Arrays", "Trees", "Graphs", "Dynamic Programming"],
        },
        {
            "id": "dsa-doc-1",
            "title": "CSES Problem Set (Algorithmic Benchmark)",
            "provider": "University of Helsinki",
            "instructor": "Antti Laaksonen",
            "type": "Practice Platform",
            "icon": "💻",
            "description": "Clean, rigorously tested algorithmic collection covering sorting, searching, range queries, tree algorithms, and mathematics.",
            "url": "https://cses.fi/problemset/",
            "difficulty": "Intermediate to Advanced",
            "topics": ["Segment Trees", "Tree Queries", "Combinatorics"],
        },
    ],
    "Computer Networks": [
        {
            "id": "cn-nptel-1",
            "title": "Computer Networks and Internet Protocol",
            "provider": "NPTEL (IIT Kharagpur)",
            "instructor": "Prof. Soumya K. Ghosh",
            "type": "NPTEL Course",
            "icon": "🎓",
            "description": "In-depth coverage of the OSI/TCP-IP stack, subnetting (CIDR), routing protocols (OSPF/BGP), TCP flow & congestion control, and TLS encryption.",
            "url": "https://nptel.ac.in/courses/106105183",
            "difficulty": "Intermediate",
            "topics": ["Subnetting", "TCP Congestion Control", "BGP", "DNS/HTTP"],
        },
        {
            "id": "cn-yt-1",
            "title": "Computer Networking Full Course",
            "provider": "freeCodeCamp / NetworkChuck",
            "instructor": "Industry Certified Engineers",
            "type": "YouTube Playlist",
            "icon": "🎥",
            "description": "Hands-on packet analysis, Ethernet frame structures, IP addressing, TCP 3-way handshake, and firewall configurations.",
            "url": "https://www.youtube.com/watch?v=IPvYjXCsTg8",
            "difficulty": "Beginner to Intermediate",
            "topics": ["TCP/IP", "Wireshark", "Routing Protocols", "Subnets"],
        },
        {
            "id": "cn-doc-1",
            "title": "IETF RFC 793 — Transmission Control Protocol",
            "provider": "Internet Engineering Task Force (IETF)",
            "instructor": "Standard Specification",
            "type": "Documentation",
            "icon": "📚",
            "description": "The foundational Internet protocol standard detailing connection state transitions, segment formats, and sequence numbering.",
            "url": "https://datatracker.ietf.org/doc/html/rfc793",
            "difficulty": "Advanced",
            "topics": ["TCP Protocol", "Handshake States", "Flow Control"],
        },
    ],
    "Artificial Intelligence & Machine Learning": [
        {
            "id": "aiml-nptel-1",
            "title": "Introduction to Machine Learning",
            "provider": "NPTEL (IIT Madras)",
            "instructor": "Prof. Balaraman Ravindran",
            "type": "NPTEL Course",
            "icon": "🎓",
            "description": "Mathematical foundations of Linear Regression, Logistic Classification, Decision Trees, SVMs, Ensemble Random Forests, and Clustering.",
            "url": "https://nptel.ac.in/courses/106106139",
            "difficulty": "Intermediate",
            "topics": ["Regression", "Decision Trees", "Ensembles", "SVM"],
        },
        {
            "id": "aiml-yt-1",
            "title": "Neural Networks & Deep Learning Intuition",
            "provider": "3Blue1Brown",
            "instructor": "Grant Sanderson",
            "type": "YouTube Playlist",
            "icon": "🎥",
            "description": "Superb mathematical animations exploring Gradient Descent, Backpropagation, Activation Functions, and Convolutional representations.",
            "url": "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi",
            "difficulty": "Beginner to Intermediate",
            "topics": ["Backpropagation", "Gradient Descent", "Loss Functions"],
        },
        {
            "id": "aiml-doc-1",
            "title": "Scikit-Learn User Guide & Machine Learning API",
            "provider": "Scikit-Learn Consortium",
            "instructor": "Open Source Community",
            "type": "Documentation",
            "icon": "📚",
            "description": "Detailed guides on cross-validation, hyperparameter tuning, pipeline preprocessing, and evaluation metrics (Precision, Recall, ROC-AUC).",
            "url": "https://scikit-learn.org/stable/user_guide.html",
            "difficulty": "Intermediate",
            "topics": ["Classification", "Clustering", "Cross-Validation", "Pipelines"],
        },
    ],
}


def get_resources_for_subject(subject_query: str) -> list[dict[str, Any]]:
    """Match subject query against curated academic resources."""
    query_lower = (subject_query or "").lower()

    if any(k in query_lower for k in ["dbms", "database", "sql", "relational"]):
        return SUBJECT_RESOURCES["Database Management Systems"]
    if any(k in query_lower for k in ["os", "operating system", "linux", "kernel"]):
        return SUBJECT_RESOURCES["Operating Systems"]
    if any(k in query_lower for k in ["dsa", "data structure", "algorithm", "tree", "graph"]):
        return SUBJECT_RESOURCES["Data Structures & Algorithms"]
    if any(k in query_lower for k in ["network", "cn", "tcp", "ip", "protocol"]):
        return SUBJECT_RESOURCES["Computer Networks"]
    if any(k in query_lower for k in ["ai", "ml", "machine learning", "intelligence", "neural"]):
        return SUBJECT_RESOURCES["Artificial Intelligence & Machine Learning"]

    # Default: return a curated selection across computer science
    return (
        SUBJECT_RESOURCES["Database Management Systems"][:2]
        + SUBJECT_RESOURCES["Operating Systems"][:2]
        + SUBJECT_RESOURCES["Data Structures & Algorithms"][:2]
    )
