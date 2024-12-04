# Microservices vs Monolith Architecture Comparison

## Monolith Architecture

This is typically what you think of when you think of a software product. If a product is built in a monolith, all of the code is in a single codebase where it is compiled and deployed together. The code is tightly coupled meaning different components are dependent on each other. This also means that it will have a single database used for all application functionalities. And when a monolith is deployed, it is usually deployed as one whole unit or executable.

### Pros

Some key advantages of a monolith architecture are:

- It is often simpler to deploy. Especially for small teams, you don't have to worry about the management of multiple services. You only have to do the DevOps for a single codebase.
- Because you only have to deploy one thing, it is usually faster to deploy rather than having to run up and tear down multiple architectures for a microservices architecture.
- The DevOps management for a single deployment requires less than a microservices architecture.

### Cons

Some potential downsides to a monolith structure are:

- Scaling a monolith structure often involves scaling the entire application even if only one part of it requires more resources.
- If a bug happens, it can potentially take down the entire application which could require having to redeploy the entire application and costing more time.
- The complexity of navigating a monolith codebase can grow as the codebase grows. Since all of the code is in one spot and often depends on each other, making changes or features can require more time and be more complicated.

### When to Use Monolith

- If you are in the early stages of your product and have limited resources.
- If you know your application has low complexity or are very clear on the future use cases.
- If you are focusing on development speed rather than critical scalability then it would be best to start with a Monolith.

## Microservice Architecture

A microservices architecture is when you break up your whole software product into smaller, independent services that all communicate with each other. Each smaller service is meant to handle a specific function for the product and operates independently of the other services. This allows for a greater capacity for scalability and flexibility. This also allows for separate services to be updated, deployed and scaled independently of other services. Since each service is independent, then that means you can use different coding languages and services that best apply for what that service needs to accomplish. This also allows easier business organization as now you can have specific teams work on specific services rather than everyone working on the same codebase which can cause merge errors. The communication between these services happens via API's like http/rest or other practices.

### Pros

- Microservices are very scalable because you only need to scale the service that is using more resources.
- Microservices are very resilient since each part is independent. That means if one service goes down, the entire software doesn't necessarily go down. This also makes it easier to fix if an error occurs since they are independent.
- Deployment can often be easier as there is likely a chance for spaghetti code and overreliance on dependencies to occur.
- You can choose which coding language and framework best meets the needs of that particle service feature. This can allow for improved performance of the overall application since each step of the service is optimized.
- Microservices can be easier to maintain since the code is broken up into smaller chunks and only deals with a particular use case.

### Cons

- Since you have a database and new language for each service, this can quickly add lots of complexity to managing and syncing the data for the overall experience.
- Since the services are communicating over the internet (https), this can cause issues since there is latency between requests. This requires the need for a solid error handling system, especially when other services become dependent on the result of other services' response.
- Deploying microservices often takes a large team. Managing that many resources is very difficult for a small team so in order to orchestrate a microservices architecture, you need a large enough company.
- Higher operational costs are usually accompanied by microservices because you are using complete backend tools for each section of your product.

### When to Use Microservices

- If you have a very large and complex system. Breaking it up can make it easier for different teams to work on and be better off when handling all the bugs that can come up.
- If you are handling tons of requests and are having trouble scaling your application, then it might be better to use microservices as you can directly scale parts of the application that require the most resources.
- If you are continuously deploying, it might be advantageous to use microservices as there is less chance that your updates can cause a disruption since you are only updating a single service at a time.
- If your product can be clearly separated into different domains and use cases where it would make sense to separate it into different services.
