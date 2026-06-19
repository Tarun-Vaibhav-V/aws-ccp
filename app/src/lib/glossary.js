/**
 * AWS service & concept glossary.
 * Used to annotate every quiz option with a factual one-liner so learners
 * understand WHY the correct option fits and the others don't — without
 * fabricating per-question reasoning. Matching is longest-name-first so
 * "Amazon EC2 Auto Scaling" wins over "Amazon EC2".
 */
const GLOSSARY = {
  // ---- Compute ----
  'EC2 Auto Scaling': 'automatically adds/removes EC2 instances to match demand (horizontal scaling).',
  'Auto Scaling': 'automatically adjusts capacity to maintain performance at the lowest cost.',
  'Elastic Load Balancing': 'distributes incoming traffic across multiple targets so none is overwhelmed.',
  'Load Balancer': 'distributes incoming traffic across multiple targets.',
  'Amazon EC2': 'resizable virtual servers (instances) — you manage the OS and software.',
  'EC2': 'resizable virtual servers (instances) in the cloud.',
  'AWS Lambda': 'serverless compute — runs your code on events; pay only per request/run.',
  'Lambda': 'serverless compute; runs code without managing servers.',
  'AWS Fargate': 'serverless compute engine for containers — no EC2 to manage.',
  'Fargate': 'serverless compute for containers (no servers to manage).',
  'Amazon ECS': 'runs and orchestrates Docker containers on AWS.',
  'Amazon EKS': 'managed Kubernetes for running containers at scale.',
  'Elastic Beanstalk': 'deploys & manages web apps for you (capacity, scaling, health) — you just upload code.',
  'AWS Batch': 'runs large-scale batch computing jobs.',
  'Lightsail': 'easy virtual private servers with a simple, bundled price.',
  'AWS Outposts': 'runs AWS infrastructure inside your own on-premises data center.',

  // ---- Ways to access / provision AWS ----
  'AWS Management Console': 'a web-based UI to access and manage AWS services through your browser.',
  'Management Console': 'the browser-based graphical interface for managing AWS resources.',
  'Command Line Interface': 'the AWS CLI — manage AWS services from a terminal using commands and scripts.',
  'AWS CLI': 'control AWS services from a terminal using commands and scripts (great for automation).',
  'AWS SDK': 'Software Development Kits — call AWS programmatically from your application code in many languages.',
  'application programming interface': 'APIs let applications interact with AWS services programmatically.',

  // ---- Storage ----
  'Amazon S3 Glacier': 'very low-cost archival object storage for rarely accessed data.',
  'S3 Glacier': 'low-cost archival storage; retrieval can take minutes to hours.',
  'Amazon S3': 'object storage — store/retrieve any amount of data; durable & scalable.',
  'Amazon EBS': 'block storage volumes attached to a single EC2 instance (like a virtual disk).',
  'EBS': 'block storage for one EC2 instance (a virtual hard drive).',
  'Amazon EFS': 'shared file storage that many EC2 instances can mount at once (Linux).',
  'EFS': 'shared, elastic file storage for multiple instances.',
  'Storage Gateway': 'hybrid storage connecting on-premises apps to AWS cloud storage.',
  'AWS Snowball': 'physical device to move large data into/out of AWS; also edge compute.',
  'Snowcone': 'smallest, portable Snow Family device for edge & data transfer.',
  'Snowmobile': 'exabyte-scale data transfer using a shipping container truck.',
  'Snow Family': 'physical devices for migrating large datasets to AWS.',

  // ---- Databases ----
  'Amazon RDS': 'managed relational database (MySQL, PostgreSQL, etc.) — AWS handles patching/backups.',
  'RDS': 'managed relational (SQL) database service.',
  'Amazon Aurora': 'high-performance MySQL/PostgreSQL-compatible managed relational database.',
  'Aurora': 'AWS-built, fast, MySQL/PostgreSQL-compatible database.',
  'DynamoDB': 'fully managed serverless NoSQL key-value database with single-digit-ms latency.',
  'Amazon Redshift': 'managed petabyte-scale data warehouse for analytics.',
  'Redshift': 'data warehouse for large-scale analytics queries.',
  'ElastiCache': 'managed in-memory cache (Redis/Memcached) to speed up apps.',
  'Amazon DocumentDB': 'managed MongoDB-compatible document database.',
  'Amazon Neptune': 'managed graph database.',
  'DMS': 'Database Migration Service — migrates databases to AWS with minimal downtime.',
  'Database Migration Service': 'migrates databases to AWS with little downtime.',

  // ---- Networking ----
  'Amazon VPC': 'your own isolated private network in AWS where you launch resources.',
  'VPC': 'a logically isolated virtual network in AWS.',
  'CloudFront': 'content delivery network (CDN) — caches content at edge locations near users.',
  'Route 53': 'scalable DNS and domain registration service.',
  'Direct Connect': 'a dedicated private network link from your data center to AWS.',
  'Global Accelerator': 'improves global app performance using the AWS backbone network.',
  'API Gateway': 'create, publish, and secure APIs at scale.',
  'Security Group': 'a virtual firewall at the instance level (stateful; allow rules only).',
  'Network ACL': 'a stateless firewall at the subnet level (allow & deny rules).',
  'Internet Gateway': 'lets resources in a VPC connect to the internet.',

  // ---- Security, Identity & Compliance ----
  'IAM Identity Center': 'central single sign-on (SSO) access to multiple AWS accounts and apps.',
  'IAM': 'Identity and Access Management — controls who can do what in your account (users, roles, policies).',
  'AWS Organizations': 'centrally manage and govern multiple AWS accounts (consolidated billing, SCPs).',
  'Service Control Policies': 'org-wide guardrails that set the maximum permissions for accounts.',
  'AWS Shield': 'managed DDoS protection (Standard is free; Advanced is paid).',
  'AWS WAF': 'web application firewall — filters malicious web requests (SQLi, XSS).',
  'Amazon Inspector': 'automated security assessment for vulnerabilities & deviations.',
  'Amazon GuardDuty': 'intelligent threat detection that monitors for malicious activity.',
  'Amazon Macie': 'uses ML to discover and protect sensitive data (like PII) in S3.',
  'AWS KMS': 'Key Management Service — create and control encryption keys.',
  'KMS': 'manages encryption keys.',
  'AWS CloudHSM': 'dedicated hardware security module for key storage.',
  'Secrets Manager': 'securely stores and rotates secrets like DB passwords and API keys.',
  'AWS Artifact': 'on-demand access to AWS compliance reports (SOC, PCI, ISO).',
  'AWS Certificate Manager': 'provision and manage SSL/TLS certificates for free.',
  'AWS Cognito': 'add sign-up/sign-in and access control to your web/mobile apps.',
  'Shared Responsibility': 'AWS secures the cloud; the customer secures what they put IN the cloud.',
  'MFA': 'Multi-Factor Authentication — a second login factor beyond the password.',
  'Root user': 'the all-powerful account owner login — protect it and avoid daily use.',

  // ---- Management, Monitoring & Governance ----
  'CloudWatch': 'monitoring — collects metrics, logs, and triggers alarms.',
  'CloudTrail': 'records API calls/account activity for auditing (who did what, when).',
  'Trusted Advisor': 'checks your account against best practices (cost, security, performance, limits).',
  'CloudFormation': 'infrastructure as code — provision resources from templates.',
  'AWS Config': 'tracks resource configurations and evaluates them for compliance.',
  'Systems Manager': 'operational management and automation for your AWS/on-prem resources.',
  'AWS Health Dashboard': 'shows the status and health of AWS services and your resources.',
  'AWS Service Catalog': 'lets organizations create and govern approved catalogs of IT services.',
  'Control Tower': 'sets up and governs a secure multi-account AWS environment.',
  'AWS Well-Architected': 'framework of best practices across six pillars for building on AWS.',
  'CloudWatch Logs': 'centralizes logs from your applications and AWS services.',

  // ---- Cost Management ----
  'Cost Explorer': 'visualize, understand, and forecast your AWS costs over time.',
  'AWS Budgets': 'set custom cost/usage budgets and get alerts when you exceed them.',
  'Cost and Usage Report': 'the most detailed AWS billing data available.',
  'TCO Calculator': 'estimates savings of running on AWS vs on-premises (cost-benefit).',
  'Total Cost of Ownership': 'estimates the cost of running on AWS vs on-premises — a cost-benefit analysis.',
  'Simple Monthly Calculator': 'a legacy AWS cost estimator, now replaced by the AWS Pricing Calculator.',
  'Pricing Calculator': 'estimates the cost of your AWS architecture before you build it.',
  'Cost Allocation Tags': 'labels on resources used to categorize and track spending.',
  'Consolidated Billing': 'one bill across all accounts in an Organization, with volume discounts.',
  'Free Tier': 'lets you try many AWS services free within limits.',
  'Reserved Instances': '1- or 3-year commitment for big discounts vs On-Demand.',
  'Savings Plans': 'commit to a $/hour usage for 1–3 years for lower prices.',
  'Spot Instances': 'spare capacity at up to 90% off; AWS can reclaim with 2-min notice.',
  'On-Demand': 'pay-as-you-go pricing with no commitment.',
  'Dedicated Host': 'a physical server reserved entirely for you (licensing/compliance).',

  // ---- Migration, Analytics, ML, Integration ----
  'Migration Hub': 'tracks the progress of application migrations to AWS.',
  'Cloud Adoption Framework': 'AWS guidance (six perspectives) to plan cloud adoption.',
  'Amazon SQS': 'managed message queue that decouples application components.',
  'SQS': 'message queue for decoupling components.',
  'Amazon SNS': 'pub/sub messaging that pushes notifications to subscribers.',
  'SNS': 'pub/sub notifications (email, SMS, Lambda, etc.).',
  'Amazon Kinesis': 'collects and processes streaming data in real time.',
  'Amazon Athena': 'run SQL queries directly on data in S3, serverless.',
  'AWS Glue': 'serverless data integration / ETL service.',
  'Amazon QuickSight': 'business intelligence dashboards and visualizations.',
  'Amazon SageMaker': 'build, train, and deploy machine learning models.',
  'Amazon Rekognition': 'image and video analysis using machine learning.',
  'Amazon Comprehend': 'natural-language processing to find insights in text.',
  'Amazon Polly': 'turns text into lifelike speech.',
  'Amazon Lex': 'builds conversational chatbots (the tech behind Alexa).',
  'Amazon Connect': 'cloud-based contact center service.',

  // ---- Support & Global Infra concepts ----
  'AWS Support': 'tiered plans (Basic, Developer, Business, Enterprise) for help and guidance.',
  'Technical Account Manager': 'a TAM is a dedicated contact included with Enterprise Support.',
  'Concierge': 'the AWS Support Concierge is a billing & account specialist included with Enterprise Support.',
  'Service Level Agreement': 'AWS’s formal commitment to a service’s uptime/availability.',
  'Availability Zone': 'one or more isolated data centers within a Region; spanning AZs gives high availability.',
  'Region': 'a geographic area containing multiple Availability Zones; data stays in-Region by default.',
  'Edge location': 'a site (used by CloudFront) that caches content close to users.',

  // ---- Account, governance & organization concepts ----
  'multiple AWS accounts': 'using a separate AWS account per environment (e.g., dev, test, production) isolates workloads for security, gives clean per-account billing, and limits the blast radius of mistakes.',
  'separate AWS accounts': 'a separate account per environment/team isolates resources, simplifies billing, and contains the impact of errors.',
  'multiple VPCs': 'creates isolated networks, but within the same account — it separates networking, not account-level billing or security boundaries.',
  'organizational units': 'OUs group accounts inside AWS Organizations so a policy can be applied to many accounts at once.',
  'AWS account': 'the basic container for your AWS resources and the boundary for billing and access.',
  'resource tagging': 'adds metadata labels to resources for organizing, cost allocation, and automation — it categorizes resources but does not isolate environments.',
  'resource tags': 'key/value labels on resources used to organize and track cost and usage.',
  'blast radius': 'the scope of impact when something fails — a smaller blast radius means failures affect less.',

  // ---- Cloud value & economics concepts ----
  'economies of scale': 'because AWS aggregates usage across many customers, it lowers costs and passes the savings on as lower pay-as-you-go prices.',
  'pay-as-you-go': 'you pay only for the resources you use, with no large upfront commitment.',
  'capital expense': 'CapEx — large upfront spending to own hardware/data centers; the cloud avoids this.',
  'CapEx': 'capital expenditure — large upfront spending on owned infrastructure.',
  'operational expense': 'OpEx — flexible pay-for-use spending, which is how cloud costs work.',
  'OpEx': 'operational expenditure — ongoing pay-as-you-go spending instead of upfront purchases.',
  'agility': 'the ability to build, test, and deploy quickly by provisioning resources on demand.',
  'go global': 'you can deploy in multiple Regions worldwide in minutes to be closer to users.',
  'managed service': 'a service where AWS handles the undifferentiated heavy lifting (patching, backups, scaling) for you.',

  // ---- Architecture & reliability concepts ----
  'horizontal scaling': 'adding more instances/nodes to handle load (scaling out).',
  'vertical scaling': 'increasing the size/power of a single instance (scaling up).',
  'high availability': 'designing systems to keep running despite failures, typically by spanning multiple Availability Zones.',
  'fault tolerance': 'the ability to keep operating without interruption even when a component fails.',
  'elasticity': 'automatically adding or removing resources to match current demand.',
  'decoupling': 'separating application components (e.g., with SQS/SNS) so they can fail and scale independently.',
  'serverless': 'run code/workloads without provisioning or managing servers; pay only for what runs.',
  'caching': 'storing frequently accessed data in fast memory to reduce latency and backend load.',
  'auto scaling group': 'a group of EC2 instances managed together and scaled automatically by EC2 Auto Scaling.',
  'read replica': 'a read-only copy of a database used to scale read traffic (e.g., Amazon RDS).',
  'Multi-AZ': 'deploys a standby copy in another Availability Zone for high availability and automatic failover.',
  'snapshot': 'a point-in-time backup of a volume or database.',
  'lifecycle policy': 'rules that automatically move S3 objects to cheaper storage or delete them over time.',

  // ---- Security concepts ----
  'encryption in transit': 'protects data while it moves across networks (e.g., TLS/HTTPS).',
  'encryption at rest': 'protects stored data by encrypting it on disk.',
  'least privilege': 'granting only the minimum permissions needed to perform a task.',
  'IAM role': 'a set of permissions that can be assumed temporarily by users, services, or apps — no long-term credentials.',
  'IAM user': 'an identity for a person or application, with long-term credentials.',
  'IAM group': 'a collection of IAM users that share the same permission policies.',
  'IAM policy': 'a JSON document that defines allowed/denied AWS actions and resources.',
  'access keys': 'long-term credentials (key ID + secret) used for programmatic/API access.',
  'password policy': 'rules enforcing strong passwords (length, complexity, rotation) for IAM users.',
  'bucket policy': 'a resource-based policy that controls who can access an S3 bucket.',
  'penetration testing': 'AWS lets customers run pen tests on their own resources for many services without prior approval.',
  'data sovereignty': 'data is subject to the laws of the country/Region where it resides — AWS keeps Region data in-Region by default.',

  // ---- Deployment model concepts ----
  'on-premises': 'infrastructure you own and run in your own data center.',
  'hybrid': 'a mix of cloud and on-premises resources connected together.',
  'cloud-native': 'applications built to run fully in the cloud using cloud services.',
  'AWS Marketplace': 'a digital catalog to find, buy, and deploy third-party software that runs on AWS.',
  'whitepaper': 'official AWS technical documents covering best practices and architectures.',

  // ---- More services ----
  'AWS Professional Services': 'a paid AWS consulting team that helps customers accelerate cloud adoption.',
  'Personal Health Dashboard': 'shows personalized alerts about AWS events that affect YOUR specific resources.',
  'AWS OpsWorks': 'configuration management using managed Chef and Puppet.',
  'AWS CodeCommit': 'a fully managed, private Git source-control repository.',
  'CodeCommit': 'managed private Git repositories for your source code.',
  'AWS Transit Gateway': 'a network hub that connects many VPCs and on-premises networks together.',
  'AWS VPN': 'an encrypted connection between your network and AWS over the public internet.',
  'software development kit': 'SDKs — libraries to access AWS programmatically from your application code.',
  'AWS Quick Start': 'pre-built, automated reference deployments for popular workloads on AWS.',
  'Quick Start': 'automated reference deployments that set up a workload on AWS using best practices.',
  'AWS Partner Network': 'APN — a global community of consulting and technology partners that build on AWS.',
  'Amazon Glacier': 'low-cost archival storage for data you rarely access (now S3 Glacier).',
  'AWS Online Tech Talks': 'free live online presentations and demos by AWS experts.',
  'AWS Classroom Training': 'instructor-led AWS training courses.',
  'AWS Discussion Forums': 'community forums for asking and answering AWS questions (now re:Post).',

  // ---- More concepts ----
  'design for failure': 'a cloud design principle — assume components will fail and architect so the system keeps working.',
  'loosely coupled': 'components are independent (often via queues/topics) so one failing or scaling doesn’t break the others.',
  'loose coupling': 'designing independent components that interact through well-defined interfaces, improving resilience and scalability.',
  'in parallel': 'running many resources/tasks at once to increase throughput — a cloud design principle.',
  'patch management': 'keeping OS and software updated; under the shared model the customer patches EC2 guests while AWS patches managed services.',
  'data center security': 'securing the physical data centers and hardware — this is always AWS’s responsibility.',
  'physical security': 'protection of facilities and hardware, which AWS is responsible for under the shared model.',
  'data encryption': 'protecting data by encrypting it both in transit and at rest.',
  'global reach': 'deploying close to users worldwide using AWS Regions and the edge network.',
  'performance efficiency': 'a Well-Architected pillar — using computing resources efficiently as demand and technology change.',
  'real-time monitoring': 'continuously collecting metrics and logs to observe systems as they run (e.g., Amazon CloudWatch).',
  'infrastructure as code': 'provisioning and managing resources from templates/code (e.g., AWS CloudFormation).',
  'object store': 'stores data as objects (file plus metadata) and scales massively — e.g., Amazon S3.',
  'convertible': 'Convertible Reserved Instances allow changing instance attributes during the term in exchange for a smaller discount.',
  'all upfront': 'paying the entire Reserved Instance cost at the start for the largest discount.',
  'access key id': 'the public part of an access key pair used with a secret key for programmatic access.',
  'capital expenditure': 'CapEx — large upfront purchases of hardware; the cloud replaces this with pay-as-you-go OpEx.',
  'volume pricing': 'combining usage across accounts (via consolidated billing) to reach higher-volume discount tiers.',
  'volume discount': 'lower per-unit pricing earned as aggregated usage grows, e.g., across consolidated accounts.',
  'one bill': 'consolidated billing combines charges from multiple accounts into a single bill.',
  'multi-site': 'an active-active disaster-recovery strategy that runs full capacity in more than one site at once.',
  'pilot light': 'a disaster-recovery strategy keeping a minimal core running, ready to scale up when needed.',
  'warm standby': 'a disaster-recovery strategy running a scaled-down but functional copy, scaled up on failover.',

  // ---- Shared responsibility & operations concepts ----
  'operating system': 'under the shared responsibility model the customer manages the guest OS on EC2 (patches, config), while AWS manages the OS of managed services.',
  'patching': 'applying software/OS updates — the customer patches EC2 guests; AWS patches managed services.',
  'hardware': 'the physical servers, storage, and networking that AWS owns, maintains, and secures.',
  'shared between': 'shared controls are a joint AWS + customer responsibility (e.g., patch management, configuration management, awareness & training).',
  'fully managed': 'AWS operates the service for you — provisioning, patching, scaling, and backups.',
  'undifferentiated heavy lifting': 'the routine infrastructure work (racking, patching, scaling) AWS handles so you can focus on your application.',

  // ---- Reliability & performance concepts ----
  'cost optimization': 'reducing spend by right-sizing, removing waste, and choosing efficient pricing — a Well-Architected pillar and a Trusted Advisor category.',
  'disaster recovery': 'planning to restore service after an outage; strategies include backup & restore, pilot light, warm standby, and multi-site.',
  'business continuity': 'keeping operations running through disruptions, often via multi-AZ/multi-Region and disaster-recovery planning.',
  'low latency': 'minimal delay for users, achieved by deploying close to them (Regions and edge locations).',
  'network traffic': 'distributed across resources by Elastic Load Balancing and absorbed by Auto Scaling as demand changes.',
  'traffic patterns': 'handled elastically — Auto Scaling and load balancing adjust automatically to changing traffic.',
  'scalability': 'the ability to grow or shrink resources to meet demand.',
  'durability': 'how well stored data is protected from loss — e.g., Amazon S3 is designed for 11 nines of durability.',
  'availability': 'the percentage of time a system is operational and accessible to users.',
  'right-sizing': 'matching instance types and sizes to actual workload needs to cut cost.',
  'right sizing': 'choosing the most cost-effective instance size for the workload.',
}

// Pre-sort keys longest-first so specific names match before generic ones.
const KEYS = Object.keys(GLOSSARY).sort((a, b) => b.length - a.length)

/** Return { term, def } for the first glossary entry found in the text, or null. */
export function annotate(text) {
  if (!text) return null
  const lower = text.toLowerCase()
  for (const key of KEYS) {
    if (lower.includes(key.toLowerCase())) {
      return { term: key, def: GLOSSARY[key] }
    }
  }
  return null
}
