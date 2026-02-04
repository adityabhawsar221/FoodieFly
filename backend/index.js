const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user.routes");
const authRouter = require("./routes/auth.routes");
const shopRouter = require("./routes/shop.routes");
const itemRouter = require("./routes/item.routes");
const orderRouter = require("./routes/order.routes");
const http = require("http");
const https = require("https");
const { Server } = require("socket.io");
const socketHandler = require("./socket");

const port = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

const allowedOriginRegex = /^https?:\/\/(localhost|127\.0\.0\.1):(5173|5174|5175)$/;
const corsOptions = {
  origin: (origin, callback) => {
    // allow non-browser tools (no origin) and local Vite dev servers
    if (!origin || allowedOriginRegex.test(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const io = new Server(server, {
  // middlewares
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOriginRegex.test(origin)) return callback(null, true);
      return callback(new Error(`Socket.IO CORS blocked origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST" , "PUT", "DELETE"],
    
  },
});

app.set("io", io);

app.use(cors(corsOptions));
// Express v5: don't use "*" here (it can crash path-to-regexp)
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  return res.send("home-page");
});

socketHandler(io);

server.listen(port, () => {
  connectDB();
  console.log(`Server is running on port ${port}`);
});
