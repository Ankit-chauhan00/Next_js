»» Authentication is the process of verifying the identity of a user. It ensures that the person or entity accessing the system is who they claim to be.

»» Authorization, on the other hand, determines what actions a user is allowed to perform within the system after they've been authenticated. It defines the permissions and access levels granted to users based on their identity and role.

(Types of Authentication)

»» Session-based :- With session-based authentication, a session is created on the server for each user after they log in. The server then sends a unique session identifier (usually stored as a cookie) to the client, which is used for subsequent requests to authenticate the user

Workflow

-When a user logs in, the server generates a unique session ID and stores session data (like user ID, expiration time, etc.) on the server side.

-The server sets a cookie in the response containing the session ID.

-For subsequent requests, the client sends the session ID along with the request.

-The server verifies the session ID against the stored session data to authenticate the user.

Pros

-Secure: Session data is stored on the server, reducing the risk of token theft.

-Easy to implement: Many web frameworks provide built-in support for session management.

-Automatic expiration: Sessions can be set to expire after a certain period, enhancing security.

Cons

-Scalability issues: Storing session data on the server can lead to scalability challenges, especially in distributed systems.

-Server-side storage: Requires server resources to manage session data, increasing server load.

-Vulnerable to CSRF attacks: Session identifiers stored in cookies can be susceptible to CSRF attacks if not properly secured.


