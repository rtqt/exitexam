const fs = require('fs');
const path = require('path');

const questionsFile = path.join(__dirname, 'src', 'data', 'initialQuestions.js');
let fileContent = fs.readFileSync(questionsFile, 'utf8');

const newQuestions = [
    {
        "id": 1,
        "theme": "Web Programming",
        "question": "Look at the following HTML tag: <address> Abera Bekele </address> Which one of the following is false about the output of the above tag?",
        "options": [
            "Abera Bekele will be formatted in Italics",
            "Abera Bekele will be formatted in Bold",
            "There will be line break above Abera Bekele",
            "There will be line break below Abera Bekele"
        ],
        "answer": 0
    },
    {
        "id": 2,
        "theme": "Operating Systems",
        "question": "When a process executes code that possibly changes the value of shared data, its execution has to be mutually exclusive. Therefore, the process is in:",
        "options": [
            "Deadlock",
            "Terminated",
            "Blocked",
            "Critical section"
        ],
        "answer": 0
    },
    {
        "id": 3,
        "theme": "Web Programming",
        "question": "Which one of the following is a false reason for why we use HTML?",
        "options": [
            "Because HTML files are flat text and very small",
            "Because it is quickly transferred over a network",
            "Because it is proprietary technology",
            "Because it works with all platforms, all browsers and all web servers"
        ],
        "answer": 0
    },
    {
        "id": 4,
        "theme": "Databases",
        "question": "Assume you are a database designer and you are given a task to specify entities, relationships, constraints on relations and data types for the data to be stored in the database. At which level of the three‑schema architecture would this be addressed?",
        "options": [
            "Conceptual level",
            "External level",
            "View level",
            "Internal level"
        ],
        "answer": 0
    },
    {
        "id": 5,
        "theme": "Programming",
        "question": "If you want to make methods and data fields of classes accessible from any class in any package, which access modifier is appropriate?",
        "options": [
            "public",
            "private",
            "protected",
            "default"
        ],
        "answer": 0
    },
    {
        "id": 6,
        "theme": "Security",
        "question": "If a company enforces mechanisms that protect information and information system from unauthorized access, use modification and destruction to maintain confidentiality, integrity and availability, then which one of the following best explains that the company did?",
        "options": [
            "Information security",
            "Campus security",
            "Network security",
            "Hardware security"
        ],
        "answer": 0
    },
    {
        "id": 7,
        "theme": "Operating Systems",
        "question": "Which one of the following is a voluntary termination of a process?",
        "options": [
            "Fatal exit",
            "Error exit",
            "Terminated by another process",
            "Killed by another process"
        ],
        "answer": 0
    },
    {
        "id": 8,
        "theme": "Theory of Computation",
        "question": "If we have two strings Z = cddc and W = ababb, then the concatenation of the two strings ZW will be?",
        "options": [
            "ZW = ababbcddc",
            "ZW = cdab",
            "ZW = cddcababb",
            "ZW = ca"
        ],
        "answer": 0
    },
    {
        "id": 9,
        "theme": "Programming",
        "question": "Which one of the following is false about scripting languages?",
        "options": [
            "They do not need compilers and development environments",
            "They are platform dependent",
            "They have simple execution model",
            "They are slower than other compiled codes"
        ],
        "answer": 0
    },
    {
        "id": 10,
        "theme": "Computer Networks",
        "question": "Which protocol of the TCP/IP is a connectionless protocol?",
        "options": [
            "Internet protocol",
            "User data protocol",
            "Transmission protocol",
            "The OSI reference model"
        ],
        "answer": 0
    },
    {
        "id": 11,
        "theme": "Programming",
        "question": "Fortran, Cobol, Lisp, C, C++, C#, and Java are grouped under generation of programming languages.",
        "options": [
            "1st generation languages",
            "3rd generation languages",
            "2nd generation languages",
            "4th generation languages"
        ],
        "answer": 0
    },
    {
        "id": 12,
        "theme": "Security",
        "question": "XYZ Company is attacked by intruders which causing system crashes, slowing down of the services and denying services to targeted users. Therefore, the company is attacked by?",
        "options": [
            "Information gathering",
            "Viruses",
            "Denial of services (DOS)",
            "Access attack"
        ],
        "answer": 0
    },
    {
        "id": 13,
        "theme": "Databases",
        "question": "Given the schemas: BOOK (BookId, Title, Publisher_name) BOOK_AUTHOR (BookId, Author_name) PUBLISHER (Name, Address, Phone) Choose the correct SQL statement to retrieve name of the publisher that published the book authored by 'Sisay'",
        "options": [
            "SELECT Name FROM BOOK BOOK_AUTHOR PUBLISHER WHERE BOOK.BookId=BOOK_AUTHOR.BookId AND PUBLISHER.Name=BOOK Publisher_name AND BOOK_AUTHOR.Author_name = 'Sisay'",
            "SELECT Name FROM BOOK BOOK_AUTHOR WHERE BOOK.BookId=BOOK_AUTHOR.BookId AND BOOK_AUTHOR.Author_name = 'Sisay'",
            "SELECT Name FROM BOOK PUBLISHER WHERE PUBLISHER.Name=BOOK Publisher_name AND BOOK_AUTHOR.Author_name = 'Sisay'",
            "SELECT Name FROM BOOK_AUTHOR PUBLISHER WHERE BOOK.BookId=BOOK_AUTHOR.BookId AND BOOK_AUTHOR.Author_name = 'Sisay'"
        ],
        "answer": 0
    },
    {
        "id": 14,
        "theme": "Databases",
        "question": "Which one of the following is not correct about heap files?",
        "options": [
            "Sorting is required to read records in particular field order",
            "Record insertion is efficient",
            "Linear search can be used to search necessary record",
            "New records are inserted at the beginning of the file"
        ],
        "answer": 0
    },
    {
        "id": 15,
        "theme": "Security",
        "question": "Which one of the following is not correct?",
        "options": [
            "Off‑the‑shelf apps are assets to be secured",
            "Security is strong if authentication can be refuted",
            "No security assures full access to assets",
            "Enforcing complete security denies access"
        ],
        "answer": 0
    },
    {
        "id": 16,
        "theme": "Software Engineering",
        "question": "If you develop software that can be easily made to work in different hardware and operating system environments, the quality your software has is ______?",
        "options": [
            "Portability",
            "Reusability",
            "Usability",
            "Correctness"
        ],
        "answer": 0
    },
    {
        "id": 17,
        "theme": "Software Engineering",
        "question": "Identifying and describing the fundamental software system abstractions and their relationships. Establishing the overall system architecture. In which phase these activities are done?",
        "options": [
            "System testing",
            "Implementation",
            "Requirement Analysis and definition",
            "System design"
        ],
        "answer": 0
    },
    {
        "id": 18,
        "theme": "Web Programming",
        "question": "Which value of form's METHOD attribute causes a form's contents to be parsed one element at a time?",
        "options": [
            "INPUT",
            "POST",
            "ACTION",
            "GET"
        ],
        "answer": 0
    },
    {
        "id": 19,
        "theme": "Theory of Computation",
        "question": "Which one of the following is false about any language L",
        "options": [
            "L³ = L¹L¹L¹",
            "L⁰ = L",
            "L* = L⁰ ∪ L¹ ∪ L² ∪ L³ ∪ L⁴ ∪ …",
            "L⁺ = L¹ ∪ L² ∪ L³ ∪ L⁴ ∪ L⁵ ∪ …"
        ],
        "answer": 0
    },
    {
        "id": 20,
        "theme": "Data Structures",
        "question": "In an array implementation of binary heap tree, if a node is stored at index i, then its parent will be stored at index",
        "options": [
            "ceiling (2*i + 1)",
            "floor(i/2)",
            "floor (2*i)",
            "ceiling ((i + 1) / 2)"
        ],
        "answer": 0
    },
    {
        "id": 21,
        "theme": "Computer Networks",
        "question": "As compared to IPv4, IPv6 can:",
        "options": [
            "Route slower and memory intensive",
            "Handle more addresses",
            "Use 128‑bits",
            "Support encryptions"
        ],
        "answer": 0
    },
    {
        "id": 22,
        "theme": "Programming",
        "question": "What is the final result of the following Java expression? 8 - 2 * 5 * (3 + 9 / 3) + 6 / 3",
        "options": [
            "-30",
            "122",
            "-50",
            "182"
        ],
        "answer": 0
    },
    {
        "id": 23,
        "theme": "Artificial Intelligence",
        "question": "Which one of the following is uniformed searching method?",
        "options": [
            "Breadth first search",
            "Iterative improvement",
            "A* search",
            "Greedy search"
        ],
        "answer": 0
    },
    {
        "id": 24,
        "theme": "Web Programming",
        "question": "Which tag is used to show program listing?",
        "options": [
            "<head>",
            "<p>",
            "<pre>",
            "<sub>"
        ],
        "answer": 0
    },
    {
        "id": 25,
        "theme": "Data Structures",
        "question": "Assume you are using Hash Table data structure having array size of 6 and your hash function is defined as follows: h(key) = key % m, where m is size of your hash table. Where key = 36 will be stored in your hash table?",
        "options": [
            "At index 6",
            "At index 1",
            "At index 35",
            "At index 0"
        ],
        "answer": 0
    },
    {
        "id": 26,
        "theme": "Programming",
        "question": "Which C++ statement is equivalent to short n; variable declaration?",
        "options": [
            "signed short int n;",
            "short double n;",
            "short float n;",
            "unsigned short n;"
        ],
        "answer": 0
    },
    {
        "id": 27,
        "theme": "Programming",
        "question": "Which one of the following is not an example of high‑level programming language?",
        "options": [
            "C++",
            "Java",
            "Assembly language",
            "C#"
        ],
        "answer": 0
    },
    {
        "id": 28,
        "theme": "Databases",
        "question": "If a transaction ends successfully and any changes executed by the transaction will be saved permanently and will not be undone, which database command can be used?",
        "options": [
            "Commit transaction",
            "Fail transaction",
            "Read_traaction",
            "Rollback"
        ],
        "answer": 0
    },
    {
        "id": 29,
        "theme": "Programming",
        "question": "Look at the following fragment code: int p = 10; int n = 5; if(n > p) { cout<<(n+p)<<endl; } Which algorithm property is not satisfied by the above C++ coded algorithm?",
        "options": [
            "Feasibility",
            "Finiteness",
            "Sequential",
            "Efficiency"
        ],
        "answer": 0
    },
    {
        "id": 30,
        "theme": "Computer Networks",
        "question": "In which transmission impairment does the effect of one transmission wire has on the other wire?",
        "options": [
            "Crosstalk",
            "Impulse",
            "Thermal",
            "Induced"
        ],
        "answer": 0
    },
    {
        "id": 31,
        "theme": "Security",
        "question": "Which one of the following is not a wireless attack?",
        "options": [
            "rogue access point",
            "phishing",
            "bluesnarfing",
            "bluejacking"
        ],
        "answer": 0
    },
    {
        "id": 32,
        "theme": "Software Engineering",
        "question": "We should not use Waterfall software development process mode in situations like:",
        "options": [
            "Software requirements change quickly",
            "Plenty resources with required expertise are available freely",
            "There are no ambiguous requirements",
            "The project is short"
        ],
        "answer": 0
    },
    {
        "id": 33,
        "theme": "Computer Organization",
        "question": "Which instruction type is used to test the value of a data word or status of computation?",
        "options": [
            "Branch instruction",
            "Data movement instruction",
            "Test instruction",
            "Data processing instruction"
        ],
        "answer": 0
    },
    {
        "id": 34,
        "theme": "Web Programming",
        "question": "Which one of the following is true about client‑server model?",
        "options": [
            "Clients connect with servers only through the Internet",
            "Client refers to end‑user's computer",
            "JavaScript is for server side programming",
            "PHP is for client side programming"
        ],
        "answer": 0
    },
    {
        "id": 35,
        "theme": "Algorithms",
        "question": "Assume it is given that f(n) = 4n² and g(n) = 8n, then which asymptotic notation is correct?",
        "options": [
            "f(n) = Big‑Oh(g(n))",
            "f(n) = little‑oh(g(n))",
            "f(n) = Ω(g(n))",
            "f(n) = θ(g(n))"
        ],
        "answer": 0
    },
    {
        "id": 36,
        "theme": "Artificial Intelligence",
        "question": "Which properties of environment are wrongly coupled?",
        "options": [
            "Static → stochastic",
            "Partially observable → Fully observable",
            "Discrete → continuous",
            "Episodic → non‑episodic"
        ],
        "answer": 0
    },
    {
        "id": 37,
        "theme": "Artificial Intelligence",
        "question": "Which one of the following searching strategies best explains the following statement? \"The searching agent is based on problem specific knowledge and the agent knows the distance different state is far away from the goal.\"",
        "options": [
            "Blind search",
            "Informed search",
            "Uninformed search",
            "Not informed search"
        ],
        "answer": 0
    },
    {
        "id": 38,
        "theme": "Web Programming",
        "question": "Which attribute of INPUT tag defines the number of characters that can be displayed in a text box without scrolling?",
        "options": [
            "MAXLENGTH",
            "TYPE",
            "SIZE",
            "VALUE"
        ],
        "answer": 0
    },
    {
        "id": 39,
        "theme": "Data Structures",
        "question": "What is the time complexity order of push() operation of Stack data structure implemented using array?",
        "options": [
            "O(n)",
            "O(log₂ n)",
            "O(n²)",
            "O(1)"
        ],
        "answer": 0
    },
    {
        "id": 40,
        "theme": "Databases",
        "question": "Which SQL command would you use if you want to give some permission to a user?",
        "options": [
            "GRANT",
            "REVOKE",
            "INSERT",
            "CREATE"
        ],
        "answer": 0
    },
    {
        "id": 41,
        "theme": "Software Engineering",
        "question": "Which type of software must act immediately?",
        "options": [
            "Generic",
            "Custom",
            "Real time",
            "Data processing"
        ],
        "answer": 0
    },
    {
        "id": 42,
        "theme": "Security",
        "question": "Which one of the following wrongly coupled about passive (offline) and active (online) attacks?",
        "options": [
            "Passive attack –> monitoring traffic",
            "Active attack –> add or delete messages",
            "Passive attack –> obtain message contents",
            "Active attack –> traffic analysis"
        ],
        "answer": 0
    },
    {
        "id": 43,
        "theme": "Data Structures",
        "question": "Which data structure is the best of all for airlines seat reservation problem?",
        "options": [
            "Stack",
            "Array",
            "Binary search tree",
            "Queue"
        ],
        "answer": 0
    },
    {
        "id": 44,
        "theme": "Data Structures",
        "question": "What is the height of a complete binary tree having n nodes?",
        "options": [
            "floor(log₂ n)",
            "ceiling(n log₂ n)",
            "floor(n/2)",
            "ceiling(n/2)"
        ],
        "answer": 0
    },
    {
        "id": 45,
        "theme": "Computer Networks",
        "question": "Which one of the following is not correct regarding TCP and UDP protocols?",
        "options": [
            "TCP is connectionless, while UDP is connection‑oriented",
            "Both manage communication of many applications",
            "TCP is connection‑oriented, while UDP is connectionless",
            "Both are transport layer protocols"
        ],
        "answer": 0
    },
    {
        "id": 46,
        "theme": "Human-Computer Interaction",
        "question": "Which one of the following is not a component of human‑computer system?",
        "options": [
            "Host computers",
            "Network hardware",
            "Security guards",
            "Humans"
        ],
        "answer": 0
    },
    {
        "id": 47,
        "theme": "Security",
        "question": "A given encryption program takes a text message and converts it using a secret key into a scrambled message. Which one of the following best describes the scrambled message?",
        "options": [
            "Encryption program",
            "Decryption program",
            "Ciphertext",
            "Secret key"
        ],
        "answer": 0
    },
    {
        "id": 48,
        "theme": "Security",
        "question": "Which one of the following is not correct about system uniformity?",
        "options": [
            "Non‑uniform configuration avoids putting all the resources to the same problem",
            "Non‑uniform configuration minimizes a probable loss",
            "Uniform configuration increases predictability",
            "In uniform configuration, if some components are poor it doesn't mean the rest are"
        ],
        "answer": 0
    },
    {
        "id": 49,
        "theme": "Theory of Computation",
        "question": "What will be the value of |Z|_d if it is given that string Z = caddba?",
        "options": [
            "2",
            "12",
            "4",
            "3"
        ],
        "answer": 0
    },
    {
        "id": 50,
        "theme": "Operating Systems",
        "question": "Which one of the following is correct?",
        "options": [
            "In Multiuser system many users can access the system concurrently",
            "Single user systems can allow concurrent access to the database",
            "In single user systems many users can login simultaneously",
            "Multiuser system can allow at most one user at a time"
        ],
        "answer": 0
    },
    {
        "id": 51,
        "theme": "Theory of Computation",
        "question": "Given input Alphabet Σ = {a,b,c,d} and empty string λ. Then, which one of the following is false about λ?",
        "options": [
            "λ ab = ab",
            "for any string Z, Z⁰ = λ",
            "λ is an element of Σ⁺",
            "|λ| = 0"
        ],
        "answer": 0
    },
    {
        "id": 52,
        "theme": "Programming",
        "question": "Which one of the following is not correct about function overloading in C++?",
        "options": [
            "Two or more overloaded functions may differ in data types of their parameters",
            "Two or more overloaded functions may differ in their number of parameters",
            "Two or more overloaded functions may differ only in their return types",
            "Two or more overloaded functions should have the same function name"
        ],
        "answer": 0
    },
    {
        "id": 53,
        "theme": "Computer Architecture",
        "question": "Which performance metrics can be used to measure the time taken to perform a read or write operation?",
        "options": [
            "Memory cycle time",
            "Fetching time",
            "Access time",
            "Transfer rate"
        ],
        "answer": 0
    },
    {
        "id": 54,
        "theme": "Theory of Computation",
        "question": "What will be the value of Zᴿ if it is given that string Z = caddba?",
        "options": [
            "abddac",
            "cad",
            "abd",
            "caddba"
        ],
        "answer": 0
    },
    {
        "id": 55,
        "theme": "Software Engineering",
        "question": "Which phase of software development process refers to modification of software to reflect changing customer and market requirements?",
        "options": [
            "Evolution",
            "Development",
            "Specification",
            "Validation"
        ],
        "answer": 0
    },
    {
        "id": 56,
        "theme": "Theory of Computation",
        "question": "Given input Alphabet Σ = {a,b,c,d} which one of the following is an element of set Σ²?",
        "options": [
            "b",
            "c",
            "ac",
            "aabbccdd"
        ],
        "answer": 0
    },
    {
        "id": 57,
        "theme": "Security",
        "question": "Which one of the following is not correct about symmetric key?",
        "options": [
            "It requires sender and receiver to share common secret key",
            "Repetitive key change is encouraged to lime data being compromised",
            "Trusted third party can generate and deliver keys",
            "Previous key cannot be used to a new key"
        ],
        "answer": 0
    },
    {
        "id": 58,
        "theme": "Software Engineering",
        "question": "Which characteristic of requirements specify that the requirement should be phrased so that there is one and only one interpretation for it?",
        "options": [
            "Unambiguous",
            "Correct",
            "Feasible",
            "Verifiable"
        ],
        "answer": 0
    },
    {
        "id": 59,
        "theme": "Programming",
        "question": "What is the output of the following C++ fragment code? int x = 15, y = 2; cout<<(x/y);",
        "options": [
            "15",
            "7.5",
            "8",
            "7"
        ],
        "answer": 0
    },
    {
        "id": 60,
        "theme": "Data Structures",
        "question": "Which one of the following is true about tree data structure?",
        "options": [
            "Tree forms cycle. In other words tree is cyclic data structure",
            "Tree is linear data structure",
            "There is only one unique path when we traverse from one node to another node in a tree",
            "Tree is static data structure"
        ],
        "answer": 0
    },
    {
        "id": 61,
        "theme": "Artificial Intelligence",
        "question": "Which one is a space where an agent perceives and acts so that an intelligent agent designer has to understand the type of it?",
        "options": [
            "Sensor",
            "Actuator",
            "Search space",
            "Environment"
        ],
        "answer": 0
    },
    {
        "id": 62,
        "theme": "Software Engineering",
        "question": "Which one of software testing is most time consuming test phase?",
        "options": [
            "Unit testing",
            "Acceptance testing",
            "System testing",
            "Integration testing"
        ],
        "answer": 0
    },
    {
        "id": 63,
        "theme": "Data Structures",
        "question": "Which one is true about Minimum Spanning Trees of graphs?",
        "options": [
            "We can have only one unique minimum spanning tree for a graph",
            "Minimum spanning tree contains all vertices from an input graph",
            "Minimum spanning trees are graphs",
            "Minimum spanning trees form cycle"
        ],
        "answer": 0
    },
    {
        "id": 64,
        "theme": "Data Structures",
        "question": "Which method can resolve collision in hashed files by proceeding from the occupied position specified by the hash address, the program checks the subsequent positions in order until an empty position is found?",
        "options": [
            "Multiple hashing",
            "Cluster indexing",
            "Chaining",
            "Open addressing"
        ],
        "answer": 0
    },
    {
        "id": 65,
        "theme": "Operating Systems",
        "question": "Which one of the following is not true about process communication?",
        "options": [
            "Processes can communicate using message passing",
            "Cooperating process neither affects nor affected by another process",
            "Cooperating process can both affect and be affected by another process",
            "Processes can communicate using shared memory"
        ],
        "answer": 0
    },
    {
        "id": 66,
        "theme": "Computer Networks",
        "question": "In which case a dedicated communication path between the sender and receiver has to be established?",
        "options": [
            "Broadcasting",
            "Circuit switching",
            "Packet switching",
            "Multiplexing"
        ],
        "answer": 0
    },
    {
        "id": 67,
        "theme": "Artificial Intelligence",
        "question": "________ is a set of procedures that uses representational language to conclude new fact from the existing ones.",
        "options": [
            "Knowledge base",
            "Interface",
            "Explanatory facility",
            "Inference engine"
        ],
        "answer": 0
    },
    {
        "id": 68,
        "theme": "Computer Architecture",
        "question": "Which is not correct about computers' evolution?",
        "options": [
            "Increasing processor speed",
            "Increasing component size",
            "Increasing I/O capacity",
            "Increasing memory size"
        ],
        "answer": 0
    },
    {
        "id": 69,
        "theme": "Operating Systems",
        "question": "Which one of the following statement is not correct about threads and processes?",
        "options": [
            "Both can create children",
            "Threads within a process execute sequentially",
            "Processes are not independent of one another",
            "If one thread is blocked, another thread can run"
        ],
        "answer": 0
    },
    {
        "id": 70,
        "theme": "Programming Languages",
        "question": "Which one of the following is a type of compiler which converts the code into assembly code only?",
        "options": [
            "Stage compiler",
            "One pass compiler",
            "Just‑in‑time compiler",
            "Incremental compiler"
        ],
        "answer": 0
    },
    {
        "id": 71,
        "theme": "Web Programming",
        "question": "Which one is true about the following JavaScript statement? document.write(\"Hello World\");",
        "options": [
            "document is property",
            "write is method",
            "write is object",
            "write is property"
        ],
        "answer": 0
    },
    {
        "id": 72,
        "theme": "Computer Networks",
        "question": "Assume you are a network designer and assigned to design a network for a company. The network spans over larger distance and it should be resilient for any failure, which is if a station fails the communication still continues by redirecting through another path. Which network topology would you use for your design?",
        "options": [
            "Star topology",
            "Bus topology",
            "Ring topology",
            "Mesh topology"
        ],
        "answer": 0
    },
    {
        "id": 73,
        "theme": "Web Programming",
        "question": "What is the output of the following fragment JavaScript? <script> for(n = 1; n < 7; n++) { if(n % 5 == 0) document.write(n + \" is multiple of 5\"); } </script>",
        "options": [
            "5 is multiple of 5",
            "1 2 3 4 5 is multiple of 5 6",
            "5 is multiple of 5 6 7",
            "1 2 3 4 5 6"
        ],
        "answer": 0
    },
    {
        "id": 74,
        "theme": "Databases",
        "question": "Under which programming language generation is SQL (Structured Query Language) grouped?",
        "options": [
            "Third generation languages",
            "Fifth generation languages",
            "First generation languages",
            "Fourth generation languages"
        ],
        "answer": 0
    },
    {
        "id": 75,
        "theme": "Programming",
        "question": "Which program takes one or more object files generated by compilers or assemblers and combines them into a single executable program?",
        "options": [
            "Loader",
            "Linker",
            "Debugger",
            "Editor"
        ],
        "answer": 0
    },
    {
        "id": 76,
        "theme": "Databases",
        "question": "If power went off while processing transaction, what should the DBMS do to reverse any changes made to the database?",
        "options": [
            "Commit_transaction",
            "Fail_transaction",
            "Rollback",
            "Read_transaction"
        ],
        "answer": 0
    }
];

let lastId = 100;

const formattedQuestions = newQuestions.map(q => {
    lastId++;
    return `    { id: ${lastId}, theme: ${JSON.stringify(q.theme)}, question: ${JSON.stringify(q.question)}, options: ${JSON.stringify(q.options)}, answer: ${q.answer} },`;
}).join('\n');

const replacement = '\n    // BATCH ADDED QUESTIONS\n' + formattedQuestions + '\n];\n';
fileContent = fileContent.replace(/\];\s*$/, replacement);

fs.writeFileSync(questionsFile, fileContent, 'utf8');
console.log('Successfully appended questions.');
