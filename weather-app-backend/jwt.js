// jwt.js (CommonJS)
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // "Bearer <token>"
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ msg: "Invalid token" });
    req.user = user; // { id, role, ... }
    next();
  });
}

module.exports = authenticateToken;


// This code is the "Security Guard" (Middleware) that sits on your server. It is the practical implementation of the **Stateless Verification** we discussed.

// Here is the line-by-line breakdown in the context of Horizontal Scaling and JWT mechanics:

// ---

// ## 1. Extracting the Token

// ```javascript
// const authHeader = req.headers["authorization"]; // "Bearer <token>"
// const token = authHeader && authHeader.split(" ")[1];

// ```

// * **The Connection:** As we discussed, the token isn't in the URL. It's in the **Header**.
// * **The Logic:** This looks for the `Authorization` header. It uses `.split(" ")` to ignore the word "Bearer" and grab only the long encoded string (the JWT).
// * **Interview Note:** If `authHeader` is missing, the code gracefully handles it rather than crashing.

// ## 2. The First "Gate" (Authentication)

// ```javascript
// if (!token) return res.status(401).json({ msg: "No token provided" });

// ```

// * **401 Unauthorized:** This means the server doesn't know who you are. This is the signal to the frontend that it might need to redirect the user to the **Login** page.

// ## 3. The Stateless Verification (The "Magic")

// ```javascript
// jwt.verify(token, process.env.JWT_SECRET, (err, user) => { ... });

// ```

// * **The Secret Key:** `process.env.JWT_SECRET` is the **Official Rubber Stamp**.
// * **No Database Call:** Notice there is **no** `db.findUser()` call here. The `verify` function simply performs a mathematical operation: it re-hashes the Header and Payload using the Secret Key and checks if the result matches the Signature provided in the token.
// * **Horizontal Scaling:** Because this logic only requires the `JWT_SECRET`, **Server A, B, and C** can all run this exact code and get the same result without talking to each other.

// ## 4. Handling Invalid/Expired Tokens

// ```javascript
// if (err) return res.status(403).json({ msg: "Invalid token" });

// ```

// * **403 Forbidden:** This happens if the signature is wrong (tampered with) or if the `exp` (expiration) time has passed.
// * **The Connection:** In our previous discussion, this `403` (or sometimes a `401`) is what triggers the frontend to hit the **`/refresh` endpoint** to get a new token.

// ## 5. Attaching the "State" to the Request

// ```javascript
// req.user = user;
// next();

// ```

// * **Hydrating the Request:** Once the token is verified, the `user` object (the **Payload/Claims** like `user_id` or `role`) is extracted from the token and attached to the `req` object.
// * **Next():** This passes the user data to the next function (the actual logic, like `getProfile` or `deletePost`).
// * **Why this is powerful:** The rest of your application now knows exactly who the user is without ever having looked at a database or a session in RAM.

// ---

// ### Summary for an Interview

// If you show this code to an interviewer, you should say:

// > "This middleware demonstrates **Stateless Authorization**. It extracts the JWT from the Bearer header and verifies it mathematically using a Secret Key. This eliminates the need for server-side sessions, allowing our application to **scale horizontally** across multiple servers, as any server with the Secret Key can validate the request."

// ---

// ### A final "Pro" tip:

// In a real interview, they might ask: *"Where does `process.env.JWT_SECRET` come from?"*
// **Answer:** It's an environment variable stored on the server. It should **never** be checked into Git/Github, and it must be the **same** across all servers in your cluster so they can all verify the same tokens.

// **Would you like me to show you the `/login` code that actually *creates* this token in the first place?**.