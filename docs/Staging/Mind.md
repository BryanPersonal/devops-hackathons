

MIND (Mind Is Not Dijon) offers you the possibility to run arbitrary commands on a large number of servers. This can be useful for patching, reporting, operations and more.

How MIND works
MIND operates through a series of coordinated interactions between the TIC backend, MIND workers, and the target landscape servers via Oasis servers. Here's an overview of the workflow:

Initiation:
The TIC backend initiates a connection to MIND workers through Oasis servers located in the target landscapes.

Job Configuration:
On each target server, configuration files are used to define jobs and track their progress. These files are stored locally on the server.

Connection Management:
Once the job configurations are in place, the connection is temporarily closed. MIND periodically re-establishes the connection to check on job completion status.

Job Execution:
The MIND worker, using limited concurrency, connects to servers within the same landscape and executes the required commands synchronously.

Result Storage:
The results of the executed jobs are collected and stored on the MIND worker.

Result Delivery:
After all jobs are complete, the TIC backend retrieves the results from the MIND worker and presents them in the TIC user interface.